# App Store — Nuxt clone

A high-fidelity clone of [apps.apple.com](https://apps.apple.com) built with **Nuxt 4**, **Vue 3** and **Tailwind CSS v4**.

The visual language follows the `Cupertino Editorial` design system that ships alongside this project
(`../cupertino_editorial/DESIGN.md`), and the layouts were reconstructed from the three reference
screens in the sibling folders (`apple_app_store_today_desktop`, `apple_app_store_top_charts`,
`apple_app_store_product_detail_reviews`).

---

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Other scripts:

| Command             | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `pnpm dev`          | Dev server with HMR                                        |
| `pnpm build`        | Production build (client + SSR)                            |
| `pnpm generate`     | Static site generation                                     |
| `pnpm preview`      | Serve the production build                                 |
| `pnpm check:icons`  | Validate that every app in the dataset has an icon mark    |
| `pnpm shot`         | Headless screenshot + DOM probe helper (see Visual checks)  |

---

## Routes

| Route                  | Screen                                                            |
| ---------------------- | ----------------------------------------------------------------- |
| `/`                    | **Today** — hero pair, biggest apps & games, in-app events, editors' favorites |
| `/charts`              | **Top Charts** — editor's insight banner, platform switcher, category filter, Top Free / Top Paid / Top Grossing, plus a **Live from Apple** mode with real rankings, genre + region pickers |
| `/app/[id]`            | **Product detail** — header lockup, stats strip, What's New, Preview carousel, Description, Ratings & Reviews with developer responses, App Privacy, Information, Supports |
| `/apps`                | Apps storefront with themed rails                                 |
| `/games`               | Games storefront with genre tiles                                 |
| `/arcade`              | Apple Arcade landing page                                         |
| `/categories`          | Category grid                                                     |
| `/categories/[slug]`   | Category listing + highest-rated rail                             |
| `/search`              | Live search: trending terms, curated matches, plus real results from Apple's public search API |

`public/offline.html` is a standalone document, not a route — it is what the service worker serves
when a navigation misses both the network and the cache.

Unknown app / category slugs render a branded 404 via `app/error.vue`.

---

## Project layout

```
app/
  app.vue                     root component
  error.vue                   branded error page
  layouts/default.vue         sidebar + top bar + footer shell
  assets/css/main.css         design tokens (light + dark) and base styles
  composables/useTheme.ts     theme state + toggle
  composables/usePwa.ts       connectivity, service-worker registration + updates
  plugins/theme.client.ts     reconciles state with the pre-paint class
  plugins/pwa.client.ts       boots connectivity tracking and the worker
  data/
    apps.ts                   the app dataset (38 titles) + chart helpers
    editorial.ts              Today page, chart insight, categories, arcade, search copy
    nav.ts                    sidebar / platform / mobile-tab navigation
  utils/logos.ts              simplified vector brand marks + icon backgrounds
  utils/format.ts             compactCount / parseCount number formatting
  utils/recommend.ts          content-based recommender for "You might also like"
  components/
    AppIcon.vue               squircle app icon
    UiIcon.vue                24px system glyph set (currentColor)
    StarRating.vue            fractional-fill amber stars
    GetButton.vue             GET → install progress ring → OPEN
    AppSidebar.vue  TopBar.vue  MobileTabBar.vue  StoreFooter.vue
    HeroCard.vue  FeatureCard.vue  EventCard.vue  PanelCard.vue
    AppRow.vue  ChartRow.vue  ChartColumn.vue  LiveChartRow.vue  AppGridCard.vue
    StoreResultCard.vue
    SectionHeading.vue  SegmentedControl.vue  ChipRow.vue
    MockScreen.vue            simulated app screenshots in device frames
    ScreenshotLightbox.vue    full-screen screenshot viewer
    RatingSummary.vue  ReviewCard.vue  InfoTable.vue
    OfflineBar.vue            offline pill + "new version available" toast
  pages/                      file-based routes
public/
  manifest.webmanifest  sw.js  offline.html  icons/
server/api/
  store-search.get.ts         same-origin proxy for the iTunes Search API
  top-charts.get.ts           live Top Charts, racing two Apple feed endpoints
shared/types/
  store.ts                    StoreResult / ChartEntry types shared by app and server
scripts/
  check-icons.cjs             icon registry validation
  shoot.mjs                   headless screenshot + DOM probe over the DevTools Protocol
```

---

## Design system

Tokens live in `app/assets/css/main.css`. Values are declared as plain custom properties on `:root`
and `.dark`, and the Tailwind theme maps onto them with `@theme inline`, so every utility resolves
through the switchable variable and the whole storefront re-themes from one place:

```css
:root { --canvas: #f5f5f7; --ink: #1d1d1f; --blue: #0071e3; … }
.dark { --canvas: #000000; --ink: #f5f5f7; --blue: #0a84ff; … }

@theme inline {
  --color-canvas: var(--canvas);
  --color-ink: var(--ink);
  --color-blue: var(--blue);
  …
}
```

| Token            | Light       | Dark        | Use                                  |
| ---------------- | ----------- | ----------- | ------------------------------------ |
| `--canvas`       | `#f5f5f7`   | `#000000`   | global page background               |
| `--card`         | `#ffffff`   | `#1c1c1e`   | elevated surfaces                    |
| `--sidebar`      | `#fbfbfd`   | `#0d0d0d`   | sidebar fill                         |
| `--recess`       | `#f7f7fa`   | `#2c2c2e`   | nested / recessed blocks             |
| `--hairline`     | `#e5e5ea`   | `#38383a`   | 1px dividers and card borders        |
| `--ink`          | `#1d1d1f`   | `#f5f5f7`   | primary text                         |
| `--muted`        | `#86868b`   | `#98989d`   | secondary text, metadata             |
| `--blue`         | `#0071e3`   | `#0a84ff`   | primary actions                      |
| `--amber`        | `#ff9500`   | `#ff9f0a`   | star ratings                         |
| `--fill`         | `black 5%`  | `white 9%`  | chips, buttons, row hovers           |

Semantic utilities keep components theme-agnostic: `bg-canvas`, `bg-card`, `text-ink`, `text-muted`,
`border-hairline`, `bg-fill`, `bg-fill-strong`, `bg-chrome`, `shadow-apple-card`.

### Dark mode

The theme is resolved by a tiny inline script in `nuxt.config.ts` that runs **before first paint**, so
there is no flash of the wrong palette. It reads `localStorage` first and falls back to
`prefers-color-scheme`. `useTheme()` exposes `toggle()` for the top-bar control, and
`plugins/theme.client.ts` reconciles the reactive state with the class the script already applied.

Two things are deliberately theme-independent:

- **Simulated app screenshots** (`.mock-screen`) stay light — they stand in for real image assets,
  exactly like the live storefront.
- **Artwork gradients** on hero/feature cards keep their own colours in both themes.

On pure black, drop shadows are invisible, so `--sh-card` switches to a hairline ring instead.

### Notable HIG details

- **Squircle icons** — every app icon uses the continuous-curve `border-radius: 22.37%` plus an inset
  hairline ring (`inset 0 0 0 1px rgba(0,0,0,.08)`).
- **Pill CTAs** — `GET` / price buttons are full pills; the install flow animates a circular progress
  ring before settling on `OPEN`.
- **Frosted chrome** — the sticky top bar and the mobile tab bar use
  `backdrop-filter: blur(20px) saturate(180%)`.
- **Horizontal snap scrollers** — the Preview carousel and rails hide their scrollbars.

---

## Assets

Almost everything is **raster-free**: icons, illustrations, gradients and "app screenshots" are drawn
with inline SVG or CSS.

- `app/utils/logos.ts` holds 51 simplified vector brand marks (ChatGPT, TikTok, Spotify, Roblox,
  Pokéball, Minecraft block, …) each paired with a background colour or gradient.
- `MockScreen.vue` renders nine kinds of plausible in-app UI (`chat`, `gallery`, `stats`, `list`,
  `camera`, `map`, `music`, `cards`, `board`) inside a phone frame.
- `HeroCard.vue` draws per-motif artwork (`sasquatch`, `highway`, `wind`, `gym`).

The one exception is the **live search results**, which load genuine 256px artwork from Apple's CDN —
they are real storefront data, not design assets.

`pnpm check:icons` fails loudly if an app references a mark that does not exist — this guards against
silently blank icons.

---

## Live App Store data

`server/api/store-search.get.ts` proxies the public iTunes Search API:

```
GET /api/store-search?term=minecraft&limit=12&country=us
→ { ok: true, results: [{ id, name, developer, category, icon, rating, ratingsCount, price, url }] }
```

The proxy keeps the request same-origin, normalises Apple's payload into `StoreResult`, and returns
`{ ok: false }` with a friendly message instead of throwing when the upstream is unreachable.

Two gotchas worth remembering:

1. Apple serves this endpoint as `Content-Type: text/javascript`, so `$fetch` needs
   `responseType: 'json'` — otherwise it hands back an unparsed string and every search looks empty.
2. The upstream sends `Access-Control-Allow-Origin: *`, but proxying is still preferable for the
   normalisation and graceful-failure behaviour.

On the client, `/search` debounces typing by 400 ms and also fetches immediately on mount, so landing
directly on `/search?q=…` shows live results without a keystroke.

### Live Top Charts

`server/api/top-charts.get.ts` serves real rankings for the **Live from Apple** mode on `/charts`:

```
GET /api/top-charts?country=us&kind=apps&limit=10
→ { ok: true, country, updated, kind, source, charts: { free: ChartEntry[], paid: [], grossing: [] } }
```

Apple publishes the same ranking data from two public JSON endpoints, so the route **races both** and
keeps whichever answers first:

| Source           | Endpoint                                                       |
| ---------------- | -------------------------------------------------------------- |
| `marketingtools` | `rss.marketingtools.apple.com/api/v2/{cc}/{genre}/{chart}/…`    |
| `itunes-rss`     | `itunes.apple.com/{cc}/rss/{chart}/limit=N[/genre=6014]/json`   |

Racing them means one slow or blocked host costs nothing, and the response reports which one won in
`source`, so the UI can be honest about where the numbers came from. If both fail the route returns
`{ ok: false, message }` and the page renders a retry card instead of an empty grid.

Neither feed carries ratings or prices — they only have name / artist / artwork — so every id from all
three charts is collected and enriched in a **single batched `lookup` call**. Artwork URLs are
rewritten from Apple's `100x100bb` thumbnails to `256x256bb`, and results are cached in-process for
10 minutes (the feeds themselves only update hourly).

Other things worth knowing:

- The legacy feeds need `genre=6014` to filter Games; the modern ones take `apps` / `games` in the path.
- `Promise.any` rejects with an `AggregateError`, so the outer `try/catch` is what produces the
  graceful `{ ok: false }` response.
- The client only fetches when the user switches to **Live**, and only re-fetches when the region or
  genre actually changes — the bundled curated view still renders instantly (and works offline).

---

## Recommendation algorithm

The **"You might also like"** rail on `/app/[id]` is not hand-picked. `app/utils/recommend.ts` scores
every other app in the dataset against the current one and returns the top six **with the reason each
one surfaced**, which the UI renders as a small chip:

| Signal                            | Weight |
| --------------------------------- | ------ |
| Same primary category             | +5.0   |
| Same developer                    | +3.5   |
| Description token similarity (Jaccard, stop-words removed) | ×6.0 |
| Price tier match                  | +1.2   |
| Rating band match                 | +1.0   |
| Chart overlap (per shared chart)  | +1.4   |
| Editorial collection overlap      | +0.8   |
| Similar age rating                | +0.3   |
| Popularity (`log10` of rating count, capped) | ≤ +1.5 |

Every contribution appends a human-readable reason ("Also in Photo & Video", "Similar feature set",
"Also charting in Top Free"), so the rail can always explain itself.

---

## Installable & offline

The storefront is a PWA: it installs to the home screen and keeps working when the network drops.

```
public/
  manifest.webmanifest   name, standalone display, theme colour, SVG icons
  sw.js                  hand-written service worker (three caches)
  offline.html           standalone fallback document, zero dependencies
  icons/                 192 / 512 / maskable marks
app/
  composables/usePwa.ts      connectivity + registration + update state
  plugins/pwa.client.ts      boots it
  components/OfflineBar.vue  "You're offline" pill + "new version" toast
```

The worker is hand-written rather than generated, so the caching rules stay readable and the project
stays dependency-free. Three caches, each with one job:

| Request                        | Strategy                                                        |
| ------------------------------ | --------------------------------------------------------------- |
| navigation (`mode: navigate`)  | network-first → same URL in cache → same path → `offline.html`    |
| hashed asset (`*.a1b2c3d4.js`) | cache-first (the name can never change)                          |
| any other same-origin GET      | stale-while-revalidate                                           |
| `/api/top-charts`              | network-first → last successful response, replayed only offline   |
| every other `/api/*`           | network-only                                                     |

Three decisions worth spelling out:

- **Updates never hijack a tab.** A new worker does not call `skipWaiting()` on its own; it waits
  until `OfflineBar` offers "A new version is ready → Reload", which posts `SKIP_WAITING` and reloads
  on `controllerchange`.
- **Live search is never replayed from cache.** Chart responses carry the feed's own timestamp, which
  the page displays, so a stale ranking is still labelled as stale. Search results have no such
  indicator, so an honest error beats yesterday's matches.
- **The fallback is a static document, not a route.** A cached page cannot stand in for a different
  URL: the hydrated router would re-resolve the real path, fail to fetch that route's chunk, and
  render an error. `offline.html` inlines its own CSS and a few lines of JS so it works with nothing
  cached but itself.

### Two things that will bite you

1. **A URL is not always one resource.** In dev, `/assets/css/main.css` is a stylesheet for a `<link>`
   and a JS module for the module graph. Storing both under the bare URL means one gets served for
   the other, and the browser rejects it on MIME grounds — which silently strips every style from the
   page offline. `cacheKey()` folds the request `destination` into the key for script/style/image/font
   variants, and `usable()` refuses to hand back a cached response whose type does not match.
2. **Service workers are registered in production only.** In dev the worker would sit between Vite
   and the page and fight the module graph for no benefit. Because of that, the offline behaviour is
   verified by registering the worker explicitly from the test harness (see below) rather than by the
   app.

Icons are SVG — Chromium accepts those for install, but iOS home-screen icons still want PNG, so
`safari` will fall back to a screenshot of the page.

---

## Screenshot lightbox

Clicking any Preview tile on `/app/[id]` opens `ScreenshotLightbox.vue`:

- Full-viewport blurred backdrop, body scroll locked (and restored on close).
- `←` / `→` / `Esc` keyboard navigation, plus prev/next buttons and real scaled-down thumbnails.
- Teleported to `<body>`, marked up as `role="dialog"` with `aria-modal`.


---

## Responsiveness

- **≥1024px** — 260px sidebar, sticky top bar with centred search, 12-column content grid, the product
  page splits into an 8-column main area and a 318px metadata sidebar.
- **768–1023px** — sidebar collapses, grids drop to 2–3 columns, the product sidebar stacks below.
- **<768px** — single column, bottom tab bar (`Today / Games / Apps / Arcade / Search`), the stats
  strip and Preview carousel become edge-to-edge snap scrollers.

---

## Visual checks

`scripts/shoot.mjs` drives a headless Chrome over the DevTools Protocol — no dependencies, since
Node 22 ships a global `WebSocket`. It captures a screenshot, reports console errors and hydration
warnings, and can probe the live DOM, so layout claims can be verified instead of assumed:

```bash
# plain screenshot
node scripts/shoot.mjs http://localhost:3000/charts .preview/charts.png

# dark mode, whole page, after clicking a tab
node scripts/shoot.mjs http://localhost:3000/charts .preview/dark.png --dark --full --click "Live from Apple"

# hold the charts API open so the loading skeleton stays on screen
node scripts/shoot.mjs http://localhost:3000/charts .preview/loading.png --hold "*/api/top-charts*" --click "Live from Apple"

# block it instead, to exercise the error state
node scripts/shoot.mjs http://localhost:3000/charts .preview/error.png --block "*/api/top-charts*" --click "Live from Apple"

# ask the page a question and print the answer
node scripts/shoot.mjs http://localhost:3000/charts --w 390 --eval "JSON.stringify({ sw: document.documentElement.scrollWidth })"

# verify the service worker actually serves the app offline:
#   --setup registers it (production-only, so the app won't),
#   --reload lets it take control and cache, then --offline + --reload proves it
node scripts/shoot.mjs http://localhost:3000/charts .preview/offline.png \
  --setup "navigator.serviceWorker.register('/sw.js').then(()=>navigator.serviceWorker.ready).then(()=>new Promise(r=>setTimeout(r,2500)))" \
  --reload --offline --reload --wait 2500 \
  --eval "JSON.stringify({online:navigator.onLine,hydrated:!!document.querySelector('#__nuxt').__vue_app__,rows:document.querySelectorAll('a[href^=\"/app/\"]').length})"

# ...and that an uncached route falls back to the static offline document
node scripts/shoot.mjs http://localhost:3000/charts .preview/fallback.png \
  --setup "..." --reload --offline --goto "http://localhost:3000/arcade"
```

`--reload`, `--goto`, `--offline` and `--online` run **in the order given**, which is what makes a
multi-step sequence like the one above expressible.

Two notes on `--offline`: it is applied to the service-worker target as well as the page (workers run
in their own target, so emulating offline on the page alone would let the worker keep fetching from
the network and the test would prove nothing), and the `--- failed requests ---` block lists the
network legs of network-first requests that the cache then satisfied — that is the expected shape of
a passing run, not a failure.

Because `--w`/`--h` go through `Emulation.setDeviceMetricsOverride`, mobile widths are emulated
properly — a headless `--window-size` alone does **not** produce a mobile viewport and gives false
readings for horizontal overflow.

---

## Notes

- The dataset is fictional-but-plausible sample content used for layout purposes. The only real data
  is what `/search` and the **Live from Apple** charts mode fetch at runtime.
- App names and marks are the property of their respective owners; the vector marks here are
  simplified abstractions drawn for demonstration.
