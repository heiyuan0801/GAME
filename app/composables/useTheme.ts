export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'appstor-theme'

/**
 * Theme state shared across the app.
 *
 * The `documentElement` class is applied *before* first paint by the inline
 * script in `nuxt.config.ts`; this composable keeps the reactive value in step
 * with the DOM and exposes the toggle used by the top bar.
 */
export function useTheme() {
  const theme = useState<Theme>('theme', () => 'light')

  function apply(next: Theme, persist = true) {
    theme.value = next
    if (import.meta.client) {
      const el = document.documentElement
      el.classList.toggle('dark', next === 'dark')
      el.style.colorScheme = next
      if (persist) {
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next)
        } catch {
          /* storage unavailable — session-only theme */
        }
      }
    }
  }

  function toggle() {
    apply(theme.value === 'dark' ? 'light' : 'dark')
  }

  /** Reconcile reactive state with what the pre-paint script already did. */
  function sync() {
    if (!import.meta.client) return
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = stored ?? (prefersDark ? 'dark' : 'light')
  }

  return { theme, toggle, apply, sync }
}
