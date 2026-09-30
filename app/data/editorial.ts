export interface HeroCard {
  id: string
  eyebrow: string
  title: string
  subtitle?: string
  appId: string
  note: string
  cta: string
  gradient: string
  glow: string
  motif: 'sasquatch' | 'highway' | 'wind' | 'gym'
}

export interface ListPanel {
  eyebrow: string
  title: string
  href: string
  appIds: string[]
}

export interface EventCard {
  id: string
  eyebrow: string
  /**
   * Accent tone name, not a hex: the eyebrow is text, so it needs a different
   * value on a white card than on a near-black one. `EventCard.vue` resolves
   * this to `var(--tone-<name>)`.
   */
  eyebrowTone: 'blue' | 'green' | 'amber'
  title: string
  body: string
  appId: string
  appNote: string
  tint: string
}

export interface FeatureCard {
  id: string
  eyebrow: string
  title: string
  appId: string
  appNote: string
  gradient: string
}

export const TODAY_HEROES: HeroCard[] = [
  {
    id: 'h1',
    eyebrow: 'Apple Arcade',
    title: 'Go Bird-Watching in Sneaky Sasquatch',
    appId: 'sneaky-sasquatch',
    note: 'Watch the new episode',
    cta: 'View',
    gradient: 'linear-gradient(135deg,#2f6b46 0%,#1d4a2f 45%,#0f2c1c 100%)',
    glow: 'radial-gradient(120% 100% at 15% 110%, rgba(122,214,150,.35), transparent 60%)',
    motif: 'sasquatch',
  },
  {
    id: 'h2',
    eyebrow: 'Games We Love',
    title: 'Life Is a Highway',
    appId: 'highway-racer-pro',
    note: 'Hit the open road in radical races.',
    cta: 'View',
    gradient: 'linear-gradient(135deg,#2f5fb0 0%,#1b3a72 45%,#0d1f42 100%)',
    glow: 'radial-gradient(120% 100% at 85% 110%, rgba(110,170,255,.35), transparent 60%)',
    motif: 'highway',
  },
]

export const TODAY_PANELS: ListPanel[] = [
  {
    eyebrow: 'Our Favorites',
    title: 'Essential iPhone Games',
    href: '/charts',
    appIds: [
      'royal-match',
      'roblox',
      'clash-royale',
      'monopoly-go',
      'brawl-stars',
      'pokemon-tcg',
    ],
  },
  {
    eyebrow: 'Now Trending',
    title: 'Popular iPhone Apps',
    href: '/charts',
    appIds: ['chatgpt', 'youtube', 'tiktok', 'claude', 'gemini', 'capcut'],
  },
]

export const TODAY_EVENTS: EventCard[] = [
  {
    id: 'e1',
    eyebrow: 'New Features',
    eyebrowTone: 'blue',
    title: 'Prep for Your Day With Gemini',
    body: 'See your schedule, tasks, tips, and more each morning.',
    appId: 'gemini',
    appNote: 'Google Gemini',
    tint: '#e8f1ff',
  },
  {
    id: 'e2',
    eyebrow: 'Try Now',
    eyebrowTone: 'green',
    title: 'Learn From Mistakes in Duolingo Chess',
    body: 'Game Review gives you a move-by-move breakdown — and ways to improve.',
    appId: 'duolingo',
    appNote: 'Duolingo',
    tint: '#e6f7ea',
  },
  {
    id: 'e3',
    eyebrow: 'What We’re Playing',
    eyebrowTone: 'amber',
    title: 'Show School Spirit in College Football',
    body: 'The road to the National Championship starts here.',
    appId: 'ea-sports-fc',
    appNote: 'E.A. Sports FC 27',
    tint: '#fff4e3',
  },
]

export const TODAY_FEATURES: FeatureCard[] = [
  {
    id: 'f1',
    eyebrow: 'Game of the Day',
    title: 'Slash and dash through breathtaking landscapes.',
    appId: 'wild-wind',
    appNote: 'One big track and a dream',
    gradient: 'linear-gradient(135deg,#3a2f7a 0%,#241a52 50%,#120c2e 100%)',
  },
  {
    id: 'f2',
    eyebrow: 'App of the Day',
    title: 'AI-powered workouts do the heavy lifting for you.',
    appId: 'smartgym',
    appNote: 'Gym & Home Workouts',
    gradient: 'linear-gradient(135deg,#2b2b30 0%,#191a1d 50%,#0b0b0d 100%)',
  },
]

/* ----------------------------- Top Charts ----------------------------- */

export const CHART_CATEGORIES = [
  'All Categories',
  'Games',
  'Productivity',
  'Social Networking',
  'Entertainment',
  'Photo & Video',
  'Utilities',
  'Finance',
]

export const CHART_INSIGHT = {
  eyebrow: "Editor's Chart Insights",
  updated: 'Updated hourly',
  title: 'Week 18: Generative AI & Spatial Utility Lead Downloads',
  body: 'Conversational engines secure unprecedented consecutive top ranks across productivity, while digital organizers and tactile simulation games surge in grossing indices.',
  cta: 'View Trends Report',
}

/* ------------------------------ Categories ----------------------------- */

export const CATEGORY_GROUPS = [
  { name: 'Games', glyph: '🎮', tint: '#e8f1ff', accent: '#0071e3' },
  { name: 'Productivity', glyph: '🗂️', tint: '#e9f7ee', accent: '#1a9c4b' },
  { name: 'Photo & Video', glyph: '📷', tint: '#fdeef3', accent: '#d62976' },
  { name: 'Social Networking', glyph: '💬', tint: '#eef0fd', accent: '#4f5bd5' },
  { name: 'Entertainment', glyph: '🍿', tint: '#fff4e3', accent: '#b26a00' },
  { name: 'Utilities', glyph: '🔧', tint: '#eef1f6', accent: '#5b6472' },
  { name: 'Music', glyph: '🎧', tint: '#e9f7ee', accent: '#1db954' },
  { name: 'Health & Fitness', glyph: '💪', tint: '#fdecec', accent: '#d13636' },
  { name: 'Education', glyph: '🎓', tint: '#eef7e9', accent: '#58cc02' },
  { name: 'Finance', glyph: '📈', tint: '#e8f1ff', accent: '#0059b5' },
  { name: 'Graphics & Design', glyph: '🎨', tint: '#f1ecfd', accent: '#7c4dff' },
  { name: 'Food & Drink', glyph: '🍽️', tint: '#fff7e0', accent: '#c98a00' },
  { name: 'Adventure', glyph: '🧭', tint: '#e9f5f0', accent: '#2f5d3a' },
  { name: 'Racing', glyph: '🏁', tint: '#eef1f6', accent: '#1f7ae0' },
]

/* -------------------------------- Arcade ------------------------------- */

export const ARCADE_FEATURED = [
  'sneaky-sasquatch',
  'wild-wind',
  'highway-racer-pro',
  'smartgym',
  'pokemon-tcg',
  'minecraft',
]

/* -------------------------------- Search ------------------------------- */

export const TRENDING_SEARCHES = [
  'sports scores',
  'budget planner',
  'language learning',
  'photo editor',
  'meditation',
  'chess',
  'recipe keeper',
  'running tracker',
]

/** App ids surfaced as search suggestions. */
export const SEARCH_SUGGESTIONS = [
  'chatgpt',
  'tiktok',
  'youtube',
  'instagram',
  'spotify',
  'duolingo',
  'minecraft',
  'gemini',
]
