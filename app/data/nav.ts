export interface NavItem {
  label: string
  to: string
  glyph: string
}

export const DISCOVER_NAV: NavItem[] = [
  { label: 'Today', to: '/', glyph: 'today' },
  { label: 'Top Charts', to: '/charts', glyph: 'chart' },
  { label: 'Games', to: '/games', glyph: 'games' },
  { label: 'Apps', to: '/apps', glyph: 'apps' },
  { label: 'Arcade', to: '/arcade', glyph: 'arcade' },
  { label: 'Categories', to: '/categories', glyph: 'categories' },
]

export const PLATFORM_NAV: NavItem[] = [
  { label: 'iPhone', to: '/charts?platform=iphone', glyph: 'phone' },
  { label: 'iPad', to: '/charts?platform=ipad', glyph: 'tablet' },
  { label: 'Mac', to: '/charts?platform=mac', glyph: 'laptop' },
  { label: 'Apple Vision', to: '/charts?platform=vision', glyph: 'vision' },
  { label: 'Apple Watch', to: '/charts?platform=watch', glyph: 'watch' },
  { label: 'Apple TV', to: '/charts?platform=tv', glyph: 'tv' },
]

export const DEVICES = [
  'iPhone 16 Pro',
  'iPhone 16',
  'iPhone 15 Pro',
  'iPad Pro 13"',
  'iPad Air 11"',
  'MacBook Pro 14"',
  'Apple Vision Pro',
  'Apple Watch Ultra 2',
  'Apple TV 4K',
]

export const MOBILE_TABS: NavItem[] = [
  { label: 'Today', to: '/', glyph: 'today' },
  { label: 'Games', to: '/games', glyph: 'games' },
  { label: 'Apps', to: '/apps', glyph: 'apps' },
  { label: 'Arcade', to: '/arcade', glyph: 'arcade' },
  { label: 'Search', to: '/search', glyph: 'search' },
]

export const PLATFORM_TABS = ['iPhone', 'iPad', 'Mac', 'Apple Watch']
