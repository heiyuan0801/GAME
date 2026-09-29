import type { AppItem } from '~/data/apps'
import { parseCount } from './format'

/**
 * Content-based recommender for "you might also like".
 *
 * Deliberately transparent: every contribution to a candidate's score is
 * recorded as a human-readable reason, so the UI can explain *why* something
 * was recommended instead of showing an unexplained list.
 */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'with', 'your', 'you',
  'is', 'it', 'its', 'that', 'this', 'from', 'by', 'as', 'at', 'be', 'are', 'app',
  'apps', 'game', 'games', 'more', 'all', 'get', 'new', 'one', 'can',
])

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  )
}

/** Jaccard similarity of two token sets, 0..1 */
function similarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0
  let shared = 0
  for (const t of a) if (b.has(t)) shared++
  return shared / (a.size + b.size - shared)
}

export interface Recommendation {
  app: AppItem
  score: number
  /** Ranked, human-readable explanations, strongest first. */
  reasons: string[]
}

const chartKeys = (a: AppItem) =>
  (Object.keys(a.chart) as Array<keyof AppItem['chart']>).filter((k) => a.chart[k] != null)

export function recommend(target: AppItem, pool: AppItem[], limit = 6): Recommendation[] {
  const targetTokens = tokenize(`${target.tagline} ${target.description}`)
  const targetCharts = new Set(chartKeys(target))
  const targetIsFree = target.price === 'Free'
  const targetHasEditors = !!target.editors?.length

  const scored: Recommendation[] = []

  for (const candidate of pool) {
    if (candidate.id === target.id) continue

    let score = 0
    const weighted: Array<{ w: number; reason: string }> = []

    // 1. Same category — the strongest signal.
    if (candidate.category === target.category) {
      score += 5
      weighted.push({ w: 5, reason: `More in ${candidate.category}` })
    }

    // 2. Same developer.
    if (candidate.developer === target.developer) {
      score += 3.5
      weighted.push({ w: 3.5, reason: `Also by ${candidate.developer}` })
    }

    // 3. Editorial copy overlap (tagline + description).
    const sim = similarity(targetTokens, tokenize(`${candidate.tagline} ${candidate.description}`))
    if (sim > 0.04) {
      score += sim * 6
      weighted.push({ w: sim * 6, reason: 'Similar focus' })
    }

    // 4. Price tier.
    if ((candidate.price === 'Free') === targetIsFree) score += 1.2

    // 5. Quality band.
    const ratingGap = Math.abs(candidate.rating - target.rating)
    if (ratingGap <= 0.15) score += 1.2
    else if (ratingGap <= 0.35) score += 0.6

    // 6. Appearing in the same charts.
    const overlap = chartKeys(candidate).filter((k) => targetCharts.has(k))
    if (overlap.length) {
      score += 1.4 * overlap.length
      weighted.push({ w: 1.4 * overlap.length, reason: 'Trending alongside' })
    }

    // 7. Both editor-picked.
    if (targetHasEditors && candidate.editors?.length) score += 0.8

    // 8. Same age rating.
    if (candidate.age === target.age) score += 0.3

    // 9. Popularity nudge so strong titles float up, capped so it never
    //    dominates the content signals above.
    const popularity = parseCount(candidate.ratingsCount)
    score += Math.min(1.5, Math.log10(1 + popularity) / 4)

    const reasons = weighted
      .sort((a, b) => b.w - a.w)
      .map((r) => r.reason)
      .slice(0, 2)

    scored.push({ app: candidate, score, reasons })
  }

  return scored
    .sort((a, b) => b.score - a.score || b.app.rating - a.app.rating)
    .slice(0, limit)
}
