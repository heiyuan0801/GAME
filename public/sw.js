/* eslint-disable no-restricted-globals */
/**
 * App Store clone — service worker.
 *
 * Hand-written rather than generated, so the caching rules are readable and the
 * project stays dependency-free. Three caches, each with one job:
 *
 *   shell  — navigations + the offline page, so routes open without a network
 *   asset  — JS/CSS/icons/fonts, content-hashed files served cache-first
 *   api    — the last successful live-charts response, replayed only offline
 *
 * Update policy: a new worker never calls `skipWaiting()` on its own. It waits
 * until the page asks for it, so an open tab is never swapped out mid-session.
 * `app/composables/usePwa.ts` surfaces that as a "new version available" toast.
 */

const VERSION = 'v1'

const SHELL_CACHE = `appstor-shell-${VERSION}`
const ASSET_CACHE = `appstor-asset-${VERSION}`
const API_CACHE = `appstor-api-${VERSION}`
const KEEP = [SHELL_CACHE, ASSET_CACHE, API_CACHE]

const OFFLINE_URL = '/offline.html'

/**
 * Precached during install. The route documents are server-rendered and
 * identical for every visitor, so caching them is safe; in a personalised app
 * only the offline fallback would belong here.
 *
 * The fallback is a plain static document rather than a route of the app: a
 * cached page cannot stand in for a different URL, because the hydrated router
 * would re-resolve the real path, fail to fetch that route's chunk, and render
 * an error instead.
 */
const PRECACHE = [
  '/',
  '/charts',
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/app-192.svg',
  '/icons/app-512.svg',
  '/icons/app-maskable.svg',
]

/** Files whose name already contains a content hash never need revalidating. */
const IMMUTABLE = /\.[0-9a-f]{8,}\.(?:js|css|woff2?|ttf|png|jpe?g|webp|svg)$/i

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE)
      // Added one by one on purpose: `addAll` rejects the whole batch if a
      // single URL 404s, which would leave the shell half-populated.
      await Promise.all(
        PRECACHE.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined),
        ),
      )
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => !KEEP.includes(key)).map((key) => caches.delete(key)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Let the browser handle anything we cannot improve on: non-GET, and
  // cross-origin traffic such as Apple's image CDN, or video byte ranges.
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (request.headers.has('range') || url.pathname.endsWith('.mp4')) return

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(api(request, url))
    return
  }
  if (request.mode === 'navigate') {
    event.respondWith(navigate(request))
    return
  }
  // Media elements issue Range requests. Storing a 206 under the full URL would
  // hand a partial body to a later full request, and re-fetching a multi-megabyte
  // preview just to revalidate is worse than letting the browser's own HTTP cache
  // own it, so media passes straight through.
  if (request.destination === 'video' || request.destination === 'audio') return

  event.respondWith(asset(request, url))
})

/**
 * Network-first. A cached copy is only a fallback, so a deploy is picked up on
 * the very next navigation instead of being pinned behind the cache.
 */
async function navigate(request) {
  const cache = await caches.open(SHELL_CACHE)
  try {
    const response = await fetch(request)
    if (response && response.ok) cache.put(request, response.clone())
    return response
  } catch {
    // Same URL first, then the same path without its query string, then the
    // standalone fallback document.
    const cached =
      (await cache.match(request)) ||
      (await cache.match(new URL(request.url).pathname)) ||
      (await cache.match(OFFLINE_URL))

    if (cached) return cached

    return new Response('<h1>Offline</h1>', {
      status: 503,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
  }
}

/**
 * Hashed files are cache-first (they can never change under the same name).
 * Everything else — including the dev server's module URLs — is
 * stale-while-revalidate: instant on repeat loads, but never permanently stale.
 */
async function asset(request, url) {
  const cache = await caches.open(ASSET_CACHE)
  const key = cacheKey(request)

  if (IMMUTABLE.test(url.pathname)) {
    const cached = await cache.match(key)
    if (cached) return cached
    const response = await fetch(request)
    await store(cache, request, response)
    return response
  }

  const cached = await cache.match(key)
  const revalidate = fetch(request)
    .then(async (response) => {
      await store(cache, request, response)
      return response
    })
    .catch(() => null)

  if (cached) return cached

  const fresh = await revalidate
  if (fresh) return fresh
  return new Response('', { status: 504, statusText: 'Offline' })
}

/**
 * A URL is not always one resource. A dev server will happily answer the same
 * path with a stylesheet for a `<link>` and a JS module for the module graph,
 * and some CDNs vary on `Accept`. Storing both under the bare URL means one
 * gets served for the other and the browser rejects it on MIME grounds, so the
 * cache key carries the request destination for the variants that can differ.
 *
 * Documents and plain `fetch()` calls keep the bare URL, so they still match
 * the entries written by the install-time precache.
 */
const VARIANTS = new Set(['script', 'style', 'image', 'font'])

function cacheKey(request) {
  if (!VARIANTS.has(request.destination)) return request
  const url = new URL(request.url)
  url.searchParams.set('__dest', request.destination)
  return new Request(url.toString())
}

/** Never hand back a cached response the browser will refuse to execute. */
const EXPECTED_TYPE = {
  script: /(java|ecma)script/i,
  style: /text\/css/i,
  image: /^image\//i,
  font: /^font\/|woff/i,
}

function usable(request, response) {
  const rule = EXPECTED_TYPE[request.destination]
  if (!rule) return true
  return rule.test(response.headers.get('content-type') || '')
}

async function store(cache, request, response) {
  // `status === 200` rather than `ok`: a 206 is a partial body and must never be
  // stored under the full URL.
  if (!response || response.status !== 200 || !usable(request, response)) return
  try {
    await cache.put(cacheKey(request), response.clone())
  } catch {
    // Opaque, already-consumed, or a response the Cache API refuses — skipping
    // the write is always safe, so never let it break the request.
  }
}

/**
 * Live charts only. Replaying them is defensible because the response carries
 * the feed's own timestamp, which the page displays — so a stale ranking is
 * still labelled as stale.
 *
 * Live search is deliberately excluded: those results have no "as of"
 * indicator, so showing yesterday's matches as if they were current would be
 * worse than the honest error state the page already renders.
 */
async function api(request, url) {
  if (!url.pathname.startsWith('/api/top-charts')) return fetch(request)

  const cache = await caches.open(API_CACHE)
  try {
    const response = await fetch(request)
    if (response && response.ok) cache.put(request, response.clone())
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return new Response(
      JSON.stringify({
        ok: false,
        country: 'us',
        updated: null,
        kind: 'apps',
        source: null,
        charts: { free: [], paid: [], grossing: [] },
        message: 'You are offline and this chart has not been saved yet.',
      }),
      { status: 503, headers: { 'content-type': 'application/json' } },
    )
  }
}
