/**
 * Connectivity + service-worker state.
 *
 * `online` starts as `true` because the server cannot know, and the first
 * client render has to agree with it — components that display offline state
 * gate on their own `mounted` flag for the same reason (see `OfflineBar.vue`).
 */
export function usePwa() {
  const online = useState('appstor-online', () => true)
  const updateReady = useState('appstor-update-ready', () => false)
  const controlled = useState('appstor-sw-controlled', () => false)

  /** Held outside reactive state — a `ServiceWorker` is not serialisable. */
  let waitingWorker: ServiceWorker | null = null

  function markWaiting(reg: ServiceWorkerRegistration) {
    if (!reg.waiting) return
    waitingWorker = reg.waiting
    updateReady.value = true
  }

  async function init() {
    if (!import.meta.client) return

    const sync = () => {
      online.value = navigator.onLine
    }
    sync()
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)

    if (!('serviceWorker' in navigator)) return

    // Production only. In dev the worker would sit between Vite and the page
    // and fight the module graph, for no benefit — HMR is the whole point there.
    if (import.meta.dev) return

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      controlled.value = !!navigator.serviceWorker.controller

      // Already waiting from a previous visit.
      markWaiting(reg)

      reg.addEventListener('updatefound', () => {
        const next = reg.installing
        if (!next) return
        next.addEventListener('statechange', () => {
          // `controller` is only set once an older worker has been in charge,
          // so this distinguishes a real update from the first install.
          if (next.state === 'installed' && navigator.serviceWorker.controller) markWaiting(reg)
        })
      })

      // Long-lived tabs otherwise never notice a deploy.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => undefined)
      })
    } catch {
      // Offline support is a bonus; never let it break the app.
    }
  }

  function applyUpdate() {
    if (!waitingWorker) return
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {
      once: true,
    })
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
  }

  return { online, updateReady, controlled, init, applyUpdate }
}
