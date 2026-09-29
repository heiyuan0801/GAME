#!/usr/bin/env node
/**
 * Headless screenshot + console capture, driven over the Chrome DevTools
 * Protocol. Zero dependencies — Node 22 ships a global WebSocket, so this needs
 * nothing beyond a Chrome/Edge binary on disk.
 *
 * Usage:
 *   node scripts/shoot.mjs <url> <out.png> [options]
 *
 * Options:
 *   --w <px>          viewport width            (default 1440)
 *   --h <px>          viewport height           (default 900)
 *   --dark            emulate prefers-color-scheme: dark
 *   --click "<text>"  click the first button/link whose text matches (repeatable)
 *   --block "<glob>"  block matching requests (repeatable) — great for error states
 *   --hold "<glob>"   pause matching requests and never resume (repeatable),
 *                     which keeps loading states on screen for the screenshot
 *   --setup "<js>"    run JS right after load, before anything else (awaited)
 *   --reload          reload the page and wait for it (repeatable, ordered)
 *   --goto "<url>"    navigate somewhere else and wait (repeatable, ordered)
 *   --offline         switch the network off (repeatable, ordered)
 *   --online          switch the network back on (repeatable, ordered)
 *   --eval "<js>"     evaluate JS in the page and print the result
 *   --a11y            audit the page for accessibility problems
 *   --wait <ms>       settle time after load    (default 1500)
 *   --full            capture the whole page
 *   --port <n>        devtools port             (default 9222)
 *
 * Env:
 *   CHROME_PATH       override the browser binary
 */
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const CHROME =
  process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const argv = process.argv.slice(2)
const url = argv[0]
const out = argv[1] && !argv[1].startsWith('--') ? argv[1] : null
if (!url) {
  console.error(
    'usage: node scripts/shoot.mjs <url> [out.png] [--w 1440] [--h 900] [--dark] [--full]\n' +
      '                              [--click "text"]... [--block glob]... [--hold glob]...\n' +
      '                              [--eval "js"] [--wait ms] [--port n]',
  )
  process.exit(2)
}

const has = (name) => argv.includes(`--${name}`)
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  if (i < 0) return fallback
  const next = argv[i + 1]
  return next && !next.startsWith('--') ? next : true
}

const width = Number(opt('w', 1440))
const height = Number(opt('h', 900))
const dark = has('dark')
const full = has('full')
/** `--click` may be repeated; the clicks run in the order given. */
const clicks = []
const blocks = []
const holds = []
/**
 * `--reload` / `--offline` / `--online` form an ordered script, because
 * verifying a service worker needs a specific sequence: reload while online so
 * the worker takes control and caches, then go offline, then reload again.
 */
const steps = []
for (let i = 0; i < argv.length; i++) {
  const next = argv[i + 1]
  const usable = next && !next.startsWith('--')
  if (argv[i] === '--click' && usable) clicks.push(next)
  if (argv[i] === '--block' && usable) blocks.push(next)
  if (argv[i] === '--hold' && usable) holds.push(next)
  if (argv[i] === '--reload') steps.push({ type: 'reload' })
  if (argv[i] === '--goto' && usable) steps.push({ type: 'goto', url: next })
  if (argv[i] === '--offline') steps.push({ type: 'offline' })
  if (argv[i] === '--online') steps.push({ type: 'online' })
}
const setupJs = opt('setup', null)
const evalJs = opt('eval', null)
const auditA11y = has('a11y')
const waitMs = Number(opt('wait', 1500))
const port = Number(opt('port', 9222))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForDevtools() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`)
      if (res.ok) return await res.json()
    } catch {
      /* not up yet */
    }
    await sleep(200)
  }
  throw new Error('devtools endpoint never came up')
}

class Cdp {
  constructor(ws) {
    this.ws = ws
    this.seq = 0
    this.pending = new Map()
    this.listeners = new Map()
  }

  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl)
    await new Promise((resolve, reject) => {
      ws.onopen = resolve
      ws.onerror = () => reject(new Error('websocket failed'))
    })
    const cdp = new Cdp(ws)
    ws.onmessage = (e) => cdp.dispatch(e.data)
    return cdp
  }

  dispatch(data) {
    const msg = JSON.parse(data)
    if (msg.id) {
      // With `flatten: true`, ids are scoped per session, so the key must be too.
      const p = this.pending.get(`${msg.sessionId ?? ''}:${msg.id}`)
      if (!p) return
      this.pending.delete(`${msg.sessionId ?? ''}:${msg.id}`)
      if (msg.error) p.reject(new Error(JSON.stringify(msg.error)))
      else p.resolve(msg.result)
      return
    }
    for (const fn of this.listeners.get(msg.method) ?? []) fn(msg.params)
  }

  send(method, params = {}, sessionId) {
    const id = ++this.seq
    const key = `${sessionId ?? ''}:${id}`
    return new Promise((resolve, reject) => {
      this.pending.set(key, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params, sessionId }))
    })
  }

  on(method, fn) {
    const list = this.listeners.get(method) ?? []
    list.push(fn)
    this.listeners.set(method, list)
  }

  close() {
    this.ws.close()
  }
}

/**
 * Accessibility audit, run entirely in the page so it can report the offending
 * HTML alongside each finding. Deliberately limited to checks that are
 * unambiguous — contrast, accessible names, target sizes, heading order,
 * aria-hidden focus traps — rather than a partial reimplementation of axe.
 *
 * Written without template literals or `${}` because it is embedded in one.
 */
const A11Y_SCRIPT = `(() => {
  const out = { contrast: [], names: [], targets: [], headings: [], hidden: [], images: [], info: {} };

  const parse = (c) => {
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(',').map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const show = (c) => 'rgb(' + Math.round(c.r) + ',' + Math.round(c.g) + ',' + Math.round(c.b) + ')';
  const clip = (el) => (el.outerHTML || '').replace(/\\s+/g, ' ').slice(0, 96);

  // Nearest opaque background, or null when a gradient/image makes it unknowable.
  const bgOf = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0.9) return c;
      node = node.parentElement;
    }
    const b = parse(getComputedStyle(document.body).backgroundColor);
    return b && b.a > 0.9 ? b : null;
  };

  const nameOf = (el) => {
    const aria = el.getAttribute('aria-label');
    if (aria && aria.trim()) return aria.trim();
    const ref = el.getAttribute('aria-labelledby');
    if (ref) {
      const t = ref.split(/\\s+/).map((id) => {
        const n = document.getElementById(id);
        return n ? n.textContent || '' : '';
      }).join(' ').trim();
      if (t) return t;
    }
    const title = el.getAttribute('title');
    if (title && title.trim()) return title.trim();
    if (el.tagName === 'INPUT' && el.labels && el.labels.length) {
      const t = Array.from(el.labels).map((l) => l.textContent || '').join(' ').trim();
      if (t) return t;
    }
    const text = (el.textContent || '').replace(/\\s+/g, ' ').trim();
    if (text) return text;
    const img = el.querySelector('img[alt]');
    if (img && img.alt.trim()) return img.alt.trim();
    const svgTitle = el.querySelector('svg title');
    if (svgTitle && svgTitle.textContent.trim()) return svgTitle.textContent.trim();
    return '';
  };

  // --- contrast ---------------------------------------------------------
  const seen = {};
  const textEls = Array.from(document.querySelectorAll('body *')).filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.opacity === '0') return false;
    return Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
  });

  for (const el of textEls) {
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.9) continue;
    const bg = bgOf(el);
    if (!bg) continue;
    const size = parseFloat(cs.fontSize);
    const weight = Number(cs.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const r = ratio(fg, bg);
    if (r >= need) continue;
    const key = show(fg) + '|' + show(bg) + '|' + need;
    if (seen[key]) { seen[key].count++; continue; }
    seen[key] = {
      count: 1, fg: show(fg), bg: show(bg), size: Math.round(size * 10) / 10,
      ratio: Math.round(r * 100) / 100, need: need, sample: clip(el),
    };
  }
  out.contrast = Object.values(seen).sort((a, b) => a.ratio - b.ratio);

  // --- interactive elements --------------------------------------------
  const interactive = Array.from(document.querySelectorAll(
    'a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=tab], [role=link], [tabindex]:not([tabindex="-1"])'
  )).filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  });

  const boxes = interactive.map((el) => ({ el: el, r: el.getBoundingClientRect() }));

  for (const el of interactive) {
    if (!nameOf(el)) out.names.push({ tag: el.tagName.toLowerCase(), html: clip(el) });
    const trap = el.closest('[aria-hidden="true"]');
    if (trap && !el.hasAttribute('disabled')) {
      out.hidden.push({ html: clip(el), container: clip(trap) });
    }
  }

  // WCAG 2.2 SC 2.5.8 wants 24x24, but two exceptions matter in practice: a
  // target inline in a block of text, and a target whose 24px circle does not
  // reach any other target. Without both, every editorial page reports a dozen
  // non-issues and the check becomes noise nobody reads.
  for (const entry of boxes) {
    const el = entry.el, r = entry.r;
    if (r.width >= 24 && r.height >= 24) continue;

    const cs = getComputedStyle(el);
    const inlineDisplay = cs.display.indexOf('inline') === 0;
    const parent = el.parentElement;
    const parentHasText = parent && Array.from(parent.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 0);
    if (inlineDisplay && parentHasText) continue;

    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let crowded = false;
    for (const other of boxes) {
      if (other.el === el) continue;
      const o = other.r;
      const nx = Math.max(o.left, Math.min(cx, o.right));
      const ny = Math.max(o.top, Math.min(cy, o.bottom));
      const dx = cx - nx, dy = cy - ny;
      if (dx * dx + dy * dy < 144) { crowded = true; break; }
    }
    if (crowded) continue;

    out.targets.push({
      tag: el.tagName.toLowerCase(), w: Math.round(r.width), h: Math.round(r.height), html: clip(el),
    });
  }

  // --- structure --------------------------------------------------------
  const levels = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
    .map((h) => Number(h.tagName[1]));
  let prev = 0;
  levels.forEach((lvl, i) => {
    if (prev && lvl > prev + 1) out.headings.push({ at: i, from: prev, to: lvl });
    prev = lvl;
  });

  out.images = Array.from(document.querySelectorAll('img:not([alt])')).map(clip);

  const first = document.querySelector('a[href^="#"]');
  out.info = {
    lang: document.documentElement.lang || null,
    h1Count: levels.filter((l) => l === 1).length,
    headingLevels: levels.join(','),
    landmarks: {
      main: document.querySelectorAll('main').length,
      nav: document.querySelectorAll('nav').length,
      header: document.querySelectorAll('header').length,
      footer: document.querySelectorAll('footer').length,
    },
    skipLink: first ? clip(first) : null,
    interactiveCount: interactive.length,
  };

  return JSON.stringify(out);
})()`

function reportA11y(raw) {
  const r = JSON.parse(raw)
  const line = (s) => console.log('  ' + s)

  const section = (title, items, render, kind = 'FAIL') => {
    if (!items.length) {
      console.log(`  ok   ${title}`)
      return
    }
    console.log(`  ${kind} ${title} — ${items.length}`)
    for (const item of items.slice(0, 8)) line(render(item))
    if (items.length > 8) line(`… and ${items.length - 8} more`)
  }

  console.log('--- a11y ---')
  section('text contrast', r.contrast, (c) =>
    `${c.ratio}:1 (need ${c.need}) ${c.fg} on ${c.bg} @${c.size}px ×${c.count} — ${c.sample}`,
  )
  section('interactive elements with no accessible name', r.names, (n) => `<${n.tag}> ${n.html}`)
  // Heuristic: the inline and spacing exceptions of SC 2.5.8 are implemented,
  // but a borderline inline link can still be reported here. Treat as a note.
  section(
    'targets under 24×24 (heuristic)',
    r.targets,
    (t) => `${t.w}×${t.h} <${t.tag}> ${t.html}`,
    'note',
  )
  section('heading level skips', r.headings, (h) => `h${h.from} → h${h.to} at heading #${h.at + 1}`)
  section('focusable inside aria-hidden', r.hidden, (h) => `${h.html}  inside ${h.container}`)
  section('images with no alt attribute', r.images, (i) => i)

  const i = r.info
  line(
    `info  lang=${i.lang} h1=${i.h1Count} levels=[${i.headingLevels}] ` +
      `landmarks=${JSON.stringify(i.landmarks)} interactive=${i.interactiveCount}`,
  )
  line(`info  skip link: ${i.skipLink ?? 'none'}`)
}

const userDataDir = mkdtempSync(join(tmpdir(), 'chrome-shoot-'))

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--mute-audio',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    `--window-size=${width},${height}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

let exitCode = 0
try {
  await waitForDevtools()

  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  const page = targets.find((t) => t.type === 'page')
  if (!page) throw new Error('no page target')

  const cdp = await Cdp.connect(page.webSocketDebuggerUrl)

  const logs = []
  const failures = []
  const requestUrls = new Map()
  cdp.on('Runtime.consoleAPICalled', (p) =>
    logs.push(`[${p.type}] ${p.args.map((a) => a.value ?? a.description ?? '').join(' ')}`),
  )
  cdp.on('Runtime.exceptionThrown', (p) =>
    logs.push(`[exception] ${p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text}`),
  )
  cdp.on('Log.entryAdded', (p) => {
    if (p.entry.level === 'error' || p.entry.level === 'warning') {
      logs.push(`[${p.entry.level}] ${p.entry.text}`)
    }
  })
  // Console text alone says a resource failed but not which one, which makes
  // cache/offline debugging guesswork.
  cdp.on('Network.requestWillBeSent', (p) => requestUrls.set(p.requestId, p.request.url))
  cdp.on('Network.loadingFailed', (p) => {
    if (p.canceled) return
    const url = requestUrls.get(p.requestId) ?? '(unknown)'
    failures.push(`${p.errorText} ${url}`)
  })

  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Log.enable')
  await cdp.send('Network.enable')

  /**
   * Service workers run in their own target, so network emulation applied to the
   * page does not reach the worker's own `fetch()` calls. Auto-attaching lets us
   * mirror the offline switch onto the worker session too — without this, an
   * "offline" reload would still be served by the network and would prove nothing.
   */
  let offlineState = false
  const workerSessions = new Set()
  cdp.on('Target.attachedToTarget', ({ sessionId, targetInfo }) => {
    if (targetInfo?.type !== 'service_worker') return
    workerSessions.add(sessionId)
    cdp.send('Network.enable', {}, sessionId).catch(() => undefined)
    cdp
      .send(
        'Network.emulateNetworkConditions',
        {
          offline: offlineState,
          latency: 0,
          downloadThroughput: -1,
          uploadThroughput: -1,
        },
        sessionId,
      )
      .catch(() => undefined)
  })
  await cdp.send('Target.setAutoAttach', {
    autoAttach: true,
    waitForDebuggerOnStart: false,
    flatten: true,
  })

  if (blocks.length) await cdp.send('Network.setBlockedURLs', { urls: blocks })
  if (holds.length) {
    // Matching requests are paused and simply never resumed, so whatever the
    // page shows while waiting stays on screen.
    await cdp.send('Fetch.enable', {
      patterns: holds.map((urlPattern) => ({ urlPattern })),
    })
  }
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: false,
  })
  await cdp.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }],
  })

  const loaded = new Promise((resolve) => cdp.on('Page.loadEventFired', resolve))
  await cdp.send('Page.navigate', { url })
  await loaded
  await sleep(700)

  if (setupJs) {
    const res = await cdp.send('Runtime.evaluate', {
      expression: String(setupJs),
      returnByValue: true,
      awaitPromise: true,
    })
    console.log(
      'setup  ->',
      res.exceptionDetails ? `threw: ${res.exceptionDetails.text}` : String(res.result.value),
    )
  }

  for (const step of steps) {
    if (step.type === 'offline' || step.type === 'online') {
      offlineState = step.type === 'offline'
      const conditions = {
        offline: offlineState,
        latency: 0,
        downloadThroughput: -1,
        uploadThroughput: -1,
      }
      await cdp.send('Network.emulateNetworkConditions', conditions)
      await Promise.all(
        [...workerSessions].map((sessionId) =>
          cdp.send('Network.emulateNetworkConditions', conditions, sessionId).catch(() => undefined),
        ),
      )
      console.log(`net    -> ${step.type} (page + ${workerSessions.size} worker session(s))`)
      continue
    }

    // `loadEventFired` never arrives if the load fails outright, so race it.
    const navigated = new Promise((resolve) => cdp.on('Page.loadEventFired', resolve))
    if (step.type === 'goto') await cdp.send('Page.navigate', { url: step.url })
    else await cdp.send('Page.reload', { ignoreCache: false })
    await Promise.race([navigated, sleep(20000)])
    await sleep(600)
    console.log(step.type === 'goto' ? `goto   -> ${step.url}` : 'reload -> done')
  }

  if (clicks.length) {
    for (const text of clicks) {
      const res = await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const want = ${JSON.stringify(text)};
          // Tabs first, then buttons, then links — a sidebar link can share a
          // label with a segmented-control tab (e.g. "Games").
          for (const sel of ['[role="tab"]', 'button', 'a']) {
            const list = [...document.querySelectorAll(sel)];
            const el = list.find(e => e.textContent.trim() === want)
                    || list.find(e => e.textContent.includes(want));
            if (el) { el.click(); return 'clicked[' + sel + ']: ' + el.textContent.trim(); }
          }
          return 'not-found';
        })()`,
        returnByValue: true,
      })
      console.log('click  ->', res.result.value)
      await sleep(300)
    }
  }

  await sleep(waitMs)

  if (evalJs) {
    const res = await cdp.send('Runtime.evaluate', {
      expression: String(evalJs),
      returnByValue: true,
      awaitPromise: true,
    })
    if (res.exceptionDetails) {
      console.log('eval   -> threw:', res.exceptionDetails.text)
    } else {
      console.log('eval   ->', JSON.stringify(res.result.value, null, 2))
    }
  }

  const probe = await cdp.send('Runtime.evaluate', {
    expression: `JSON.stringify({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    })`,
    returnByValue: true,
  })
  console.log('page   ->', probe.result.value)

  if (auditA11y) {
    const res = await cdp.send('Runtime.evaluate', {
      expression: A11Y_SCRIPT,
      returnByValue: true,
    })
    if (res.exceptionDetails) console.log('--- a11y --- audit threw:', res.exceptionDetails.text)
    else reportA11y(res.result.value)
  }

  let captureHeight = height
  if (out) {
    if (full) {
      const { scrollHeight } = JSON.parse(probe.result.value)
      captureHeight = Math.min(scrollHeight, 12000)
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width,
        height: captureHeight,
        deviceScaleFactor: 2,
        mobile: false,
      })
      await sleep(400)
    }

    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' })
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, Buffer.from(shot.data, 'base64'))
    console.log(`shot   -> ${out} (${width}x${captureHeight})`)
  }

  if (logs.length) {
    console.log('--- console ---')
    for (const line of logs) console.log(' ', line)
  } else {
    console.log('console -> clean')
  }

  if (failures.length) {
    console.log(`--- failed requests (${failures.length}) ---`)
    for (const line of failures.slice(0, 25)) console.log(' ', line)
    if (failures.length > 25) console.log(`  … and ${failures.length - 25} more`)
  }

  cdp.close()
} catch (err) {
  console.error('FAILED:', err.message)
  exitCode = 1
} finally {
  chrome.kill('SIGKILL')
}

process.exit(exitCode)
