import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'App Store',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#f5f5f7', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#000000', media: '(prefers-color-scheme: dark)' },
        {
          name: 'description',
          content:
            'App Store — discover apps and games curated by editors. A Nuxt clone of apps.apple.com.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/icons/app-192.svg' },
      ],
      script: [
        {
          // Resolve the theme before first paint so there is no flash of the
          // wrong palette. Kept tiny and dependency-free on purpose.
          innerHTML:
            "(function(){try{var k='appstor-theme',s=localStorage.getItem(k),t=s==='dark'||s==='light'?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'),e=document.documentElement;e.classList.toggle('dark',t==='dark');e.style.colorScheme=t;}catch(e){}})();",
          tagPriority: 'critical',
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})
