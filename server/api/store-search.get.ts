interface ITunesSoftware {
  trackId: number
  trackName: string
  artistName: string
  primaryGenreName: string
  artworkUrl100?: string
  averageUserRating?: number
  userRatingCount?: number
  formattedPrice?: string
  trackViewUrl: string
}

/**
 * Server-side proxy for the public iTunes Search API.
 *
 * Proxying (rather than calling it from the browser) keeps the request
 * same-origin, lets us normalise the payload once, and gives us a place to
 * fail gracefully when the upstream is unreachable.
 */
export default defineEventHandler(async (event): Promise<StoreSearchResponse> => {
  const query = getQuery(event)
  const term = String(query.term ?? '').trim()
  const limit = Math.min(24, Math.max(1, Number(query.limit ?? 12) || 12))
  const raw = String(query.country ?? 'us')
  const country = /^[a-z]{2}$/i.test(raw) ? raw.toLowerCase() : 'us'

  if (term.length < 2) {
    return { ok: true, results: [] }
  }

  try {
    const data = await $fetch<{ results?: ITunesSoftware[] }>(
      'https://itunes.apple.com/search',
      {
        params: { term, entity: 'software', limit, country },
        headers: { accept: 'application/json' },
        timeout: 8000,
        // Apple serves this endpoint as `Content-Type: text/javascript`,
        // so ofetch would otherwise hand back an unparsed string.
        responseType: 'json',
      },
    )

    const results: StoreResult[] = (data.results ?? [])
      .filter((r) => r.trackId && r.trackName)
      .map((r) => ({
        id: r.trackId,
        name: r.trackName,
        developer: r.artistName,
        category: r.primaryGenreName,
        icon: (r.artworkUrl100 ?? '').replace(/\/100x100bb\.(jpg|png)$/, '/256x256bb.$1'),
        rating: Math.round((r.averageUserRating ?? 0) * 10) / 10,
        ratingsCount: r.userRatingCount ?? 0,
        price: r.formattedPrice ?? 'Free',
        url: r.trackViewUrl,
      }))

    // Search results are cheap to reuse briefly.
    setHeader(event, 'cache-control', 'public, max-age=60, s-maxage=300')

    return { ok: true, results }
  } catch {
    setResponseStatus(event, 200)
    return {
      ok: false,
      results: [],
      message: 'Live App Store results are unavailable right now.',
    }
  }
})
