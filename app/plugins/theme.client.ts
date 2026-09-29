/**
 * Aligns the reactive theme state with the class the pre-paint script
 * already applied to <html>, so the toggle shows the correct icon on
 * first render without any flash.
 */
export default defineNuxtPlugin(() => {
  const { sync } = useTheme()
  sync()
})
