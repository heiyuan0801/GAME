/**
 * Normalised shape for a live result from the public iTunes Search API.
 * Lives in `shared/` so both the Nitro route and the Vue app can use it.
 */
export interface StoreResult {
  id: number
  name: string
  developer: string
  category: string
  /** 256px artwork URL */
  icon: string
  rating: number
  ratingsCount: number
  /** e.g. "Free" or "$4.99" */
  price: string
  url: string
}

export interface StoreSearchResponse {
  ok: boolean
  results: StoreResult[]
  message?: string
}

/** One row of a live Apple top-charts feed, enriched via the lookup API. */
export interface ChartEntry {
  rank: number
  id: number
  name: string
  developer: string
  category: string
  icon: string
  rating: number
  ratingsCount: number
  price: string
  priceNote: string
  url: string
}

export type ChartKind = 'free' | 'paid' | 'grossing'
export type ChartGenre = 'apps' | 'games'

/** Which Apple endpoint actually served the ranking. */
export type ChartFeed = 'marketingtools' | 'itunes-rss'

export interface TopChartsResponse {
  ok: boolean
  country: string
  /** ISO timestamp from the feed */
  updated: string | null
  kind: ChartGenre
  /** `null` when the request failed. */
  source: ChartFeed | null
  charts: Record<ChartKind, ChartEntry[]>
  message?: string
}
