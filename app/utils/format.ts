/** 1234567 -> "1.2M", 950000 -> "950K" */
export function compactCount(n: number): string {
  if (!n || n < 0) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return String(n)
}

/** "4.9M" -> 4900000 ; "950K" -> 950000 ; "1.2 GB" -> 0 */
export function parseCount(s: string): number {
  const m = /^([\d.]+)\s*([KMB])?/i.exec(s.trim())
  if (!m) return 0
  const value = Number(m[1])
  if (!Number.isFinite(value)) return 0
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] ?? '').toLowerCase()] ?? 1
  return value * mult
}
