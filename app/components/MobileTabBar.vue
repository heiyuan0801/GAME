<script setup lang="ts">
import { MOBILE_TABS } from '~/data/nav'

const route = useRoute()
const isActive = (to: string) => {
  const base = to.split('?')[0]!
  if (base === '/') return route.path === '/'
  return route.path === base || route.path.startsWith(base + '/')
}
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-hairline/80 bg-chrome pb-[env(safe-area-inset-bottom)] frosted lg:hidden"
    aria-label="Primary"
  >
    <ul class="mx-auto flex max-w-lg items-stretch justify-around px-1">
      <li v-for="t in MOBILE_TABS" :key="t.to" class="flex-1">
        <NuxtLink
          :to="t.to"
          class="flex flex-col items-center gap-[3px] py-2 transition"
          :class="isActive(t.to) ? 'text-blue' : 'text-ink/50'"
        >
          <UiIcon :name="t.glyph" :size="22" />
          <span class="text-[10px] font-medium tracking-[0.005em]">{{ t.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
