/**
 * Live App Store top charts.
 *
 * Apple publishes the same ranking data through two public JSON endpoints:
 *
 *   1. `rss.marketingtools.apple.com`      — the current, recommended feed.
 *   2. `itunes.apple.com/{cc}/rss/...`     — the legacy chart feeds.
 *
 * They are requested in parallel and whichever answers first wins. Racing them
 * keeps the route fast on networks where one host is slow or unreachable, and
 * it degrades to an explicit error object instead of a blank page when both
 * fail. Both feeds only carry name / artist / artwork, so every id is then
 * enriched in a single batch `lookup` call to recover ratings and prices.
 */

interface ModernEntry {
  id: string
  name: string
  artistName: string
  artworkUrl100?: string
  url: string
}

interface LegacyEntry {
  'im:name'?: { label?: string }
  'im:image'?: { label?: string; attributes?: { height?: string } }[]
  'im:artist'?: { label?: string }
  'im:price'?: { label?: string; attributes?: { amount?: string } }
  category?: { attributes?: { label?: string } }
  id?: { label?: string; attributes?: { 'im:id'?: string } }
  link?: { attributes?: { href?: string } }[]
}

interface LookupItem {
  trackId: number
  trackName: string
  artistName: string
  primaryGenreName?: string
  artworkUrl100?: string
  artworkUrl512?: string
  averageUserRating?: number
  userRatingCount?: number
  formattedPrice?: string
  price?: number
  trackViewUrl: string
}

/** Normalised shape shared by both feeds before enrichment. */
interface SourceEntry {
  id: number
  name: string
  developer: string
  category: string
  artwork: string
  url: string
  price: string
}

interface FeedOutcome {
  source: ChartFeed
  updated: string | null
  entries: SourceEntry[]
}

const MODERN_BASE = 'https://rss.marketingtools.apple.com/api/v2'
const LEGACY_BASE = 'https://itunes.apple.com'

const MODERN_PATH: Record<ChartKind, string> = {
  free: 'top-free',
  paid: 'top-paid',
  grossing: 'top-grossing',
}

const LEGACY_PATH: Record<ChartKind, string> = {
  free: 'topfreeapplications',
  paid: 'toppaidapplications',
  grossing: 'topgrossingapplications',
}

/** Apple's genre id for Games — the legacy feeds need it to filter. */
const GAMES_GENRE_ID = 6014

const FEED_TIMEOUT_MS = 6000

/** Every artwork URL ends in `/{w}x{h}bb.{ext}`; rewrite it to one size. */
const ARTWORK_SIZE = /\/\d+x\d+bb\.(jpg|png)$/
function square(url: string, size = 256): string {
  if (!url) return ''
  return url.replace(ARTWORK_SIZE, (_m, ext: string) => `/${size}x${size}bb.${ext}`)
}

/**
 * Tiny in-process cache. The feeds update hourly, so re-fetching on every page
 * view would be both slow and rude to Apple's servers.
 */
const CACHE_TTL_MS = 10 * 60 * 1000
const cache = new Map<string, { at: number; value: TopChartsResponse }>()

async function fetchModern(
  country: string,
  genre: ChartGenre,
  chart: ChartKind,
  limit: number,
): Promise<FeedOutcome> {
  const url = `${MODERN_BASE}/${country}/${genre}/${MODERN_PATH[chart]}/${limit}/${genre}.json`

  const feed = await $fetch<{ feed?: { updated?: string; results?: ModernEntry[] } }>(url, {
    responseType: 'json',
    timeout: FEED_TIMEOUT_MS,
  })

  const entries = (feed.feed?.results ?? [])
    .filter((r) => Number.isFinite(Number(r.id)))
    .map<SourceEntry>((r) => ({
      id: Number(r.id),
      name: r.name,
      developer: r.artistName,
      category: '',
      artwork: square(r.artworkUrl100 ?? ''),
      url: r.url,
      price: '',
    }))

  if (!entries.length) throw new Error('modern feed returned no entries')

  return { source: 'marketingtools', updated: feed.feed?.updated ?? null, entries }
}

async function fetchLegacy(
  country: string,
  genre: ChartGenre,
  chart: ChartKind,
  limit: number,
): Promise<FeedOutcome> {
  const filter = genre === 'games' ? `/genre=${GAMES_GENRE_ID}` : ''
  const url = `${LEGACY_BASE}/${country}/rss/${LEGACY_PATH[chart]}/limit=${limit}${filter}/json`

  const feed = await $fetch<{
    feed?: { updated?: { label?: string }; entry?: LegacyEntry[] }
  }>(url, { responseType: 'json', timeout: FEED_TIMEOUT_MS })

  const entries = (feed.feed?.entry ?? [])
    .map<SourceEntry>((e) => ({
      id: Number(e.id?.attributes?.['im:id']),
      name: e['im:name']?.label ?? '',
      developer: e['im:artist']?.label ?? '',
      category: e.category?.attributes?.label ?? '',
      artwork: square(e['im:image']?.at(-1)?.label ?? ''),
      url: e.id?.label ?? e.link?.[0]?.attributes?.href ?? '',
      price: e['im:price']?.label ?? '',
    }))
    .filter((e) => Number.isFinite(e.id) && e.id > 0)

  if (!entries.length) throw new Error('legacy feed returned no entries')

  return { source: 'itunes-rss', updated: feed.feed?.updated?.label ?? null, entries }
}

function fetchChart(
  country: string,
  genre: ChartGenre,
  chart: ChartKind,
  limit: number,
): Promise<FeedOutcome> {
  // Whichever Apple host answers first wins.
  return Promise.any([
    fetchModern(country, genre, chart, limit),
    fetchLegacy(country, genre, chart, limit),
  ])
}

/** Recover ratings, prices and genres for every id in one batched call. */
async function enrich(ids: number[], country: string): Promise<LookupItem[]> {
  if (!ids.length) return []
  const data = await $fetch<{ results?: LookupItem[] }>(`${LEGACY_BASE}/lookup`, {
    params: { id: ids.join(','), country, entity: 'software' },
    responseType: 'json',
    timeout: 10_000,
  })
  return data.results ?? []
}

function toEntry(rank: number, src: SourceEntry, detail?: LookupItem): ChartEntry {
  const rawPrice = detail?.formattedPrice ?? src.price
  const free = rawPrice === 'Get' || rawPrice === 'Free' || detail?.price === 0

  return {
    rank,
    id: src.id,
    name: detail?.trackName ?? src.name,
    developer: detail?.artistName ?? src.developer,
    category: detail?.primaryGenreName ?? (src.category || 'App'),
    icon: square(detail?.artworkUrl512 ?? detail?.artworkUrl100 ?? src.artwork),
    rating: Math.round((detail?.averageUserRating ?? 0) * 10) / 10,
    ratingsCount: detail?.userRatingCount ?? 0,
    price: free ? 'Free' : rawPrice || '—',
    priceNote: free ? 'In-App Purchases' : 'Paid',
    url: detail?.trackViewUrl ?? src.url,
  }
}

export default defineEventHandler(async (event): Promise<TopChartsResponse> => {
  const query = getQuery(event)
  const rawCountry = String(query.country ?? 'us')
  const country = /^[a-z]{2}$/i.test(rawCountry) ? rawCountry.toLowerCase() : 'us'
  const genre: ChartGenre = String(query.kind ?? 'apps') === 'games' ? 'games' : 'apps'
  const limit = Math.min(25, Math.max(1, Number(query.limit ?? 10) || 10))

  const cacheKey = `${country}:${genre}:${limit}`
  const hit = cache.get(cacheKey)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    setHeader(event, 'cache-control', 'public, max-age=300, s-maxage=600')
    return hit.value
  }

  const kinds: ChartKind[] = ['free', 'paid', 'grossing']

  try {
    const feeds = await Promise.all(kinds.map((k) => fetchChart(country, genre, k, limit)))

    const allIds = [...new Set(feeds.flatMap((f) => f.entries.map((e) => e.id)))]
    const details = await enrich(allIds, country)
    const detailById = new Map(details.map((d) => [d.trackId, d]))

    const charts = {} as Record<ChartKind, ChartEntry[]>
    kinds.forEach((k, i) => {
      const feed = feeds[i]!
      charts[k] = feed.entries.map((e, idx) => toEntry(idx + 1, e, detailById.get(e.id)))
    })

    const value: TopChartsResponse = {
      ok: true,
      country,
      updated: feeds[0]?.updated ?? null,
      kind: genre,
      source: feeds[0]?.source ?? null,
      charts,
    }

    cache.set(cacheKey, { at: Date.now(), value })
    setHeader(event, 'cache-control', 'public, max-age=300, s-maxage=600')
    return value
  } catch {
    return {
      ok: false,
      country,
      updated: null,
      kind: genre,
      source: null,
      charts: { free: [], paid: [], grossing: [] },
      message: 'Live charts are unavailable right now.',
    }
  }
})
