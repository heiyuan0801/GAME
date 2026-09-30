/**
 * Restores the stored session once the app has mounted.
 *
 * Deliberately not before: the server has no access to `localStorage`, so
 * reading it any earlier would make the first client render disagree with the
 * server-rendered markup — the same trap the theme toggle documents.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { restore } = useAuth()
  nuxtApp.hook('app:mounted', () => restore())
})
