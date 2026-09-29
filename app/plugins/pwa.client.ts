/**
 * Boots connectivity tracking and (in production) registers the service
 * worker. Kept out of `app.vue` so the shell stays about layout.
 */
export default defineNuxtPlugin(() => {
  const { init } = usePwa()
  init()
})
