<script setup lang="ts">
import { APPS, topGrossing, topFree, type AppItem } from '~/data/apps'

useHead({ title: 'Games — App Store' })

const games = APPS.filter((a) => a.category === 'Games')

const groups = computed(() => {
  const byCat = (c: string) => APPS.filter((a) => a.category === c).slice(0, 6)
  return [
    { title: 'Top Games Right Now', apps: topGrossing(6) },
    { title: 'Free to Play', apps: topFree(6) },
    { title: 'Adventure Awaits', apps: byCat('Adventure') },
    { title: 'Racing', apps: byCat('Racing') },
  ].filter((g) => g.apps.length)
})

const genres = ['Action', 'Adventure', 'Racing', 'Puzzle', 'Strategy', 'Simulation', 'Casual', 'Card']
const genreTint: Record<string, string> = {
  Action: '#e8f1ff',
  Adventure: '#e9f5f0',
  Racing: '#eef1f6',
  Puzzle: '#f1ecfd',
  Strategy: '#fff7e0',
  Simulation: '#e9f7ee',
  Casual: '#fdeef3',
  Card: '#eef0fd',
}
</script>

<template>
  <div class="mx-auto max-w-[1180px] px-4 pt-6 pb-4 sm:px-6 sm:pt-8">
    <header class="mb-6">
      <h1 class="text-[32px] leading-none font-bold tracking-[-0.022em] sm:text-[40px]">Games</h1>
      <p class="mt-2 max-w-[60ch] text-[14px] text-muted">
        {{ games.length }} titles on the storefront right now — from three-minute battles to
        hundred-hour worlds.
      </p>
    </header>

    <!-- Genre chips -->
    <section class="mb-10">
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          v-for="g in genres"
          :key="g"
          class="rounded-[16px] border border-hairline p-4"
          :style="{ background: genreTint[g] }"
        >
          <p class="text-[14.5px] font-semibold tracking-[-0.01em] on-light">{{ g }}</p>
          <p class="mt-0.5 text-[11.5px] on-light-muted">Explore</p>
        </div>
      </div>
    </section>

    <section v-for="g in groups" :key="g.title" class="mb-10">
      <SectionHeading :title="g.title" :more="{ label: 'See all', to: '/charts' }" />
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <AppGridCard v-for="a in g.apps" :key="a.id" :app="a" />
      </div>
    </section>
  </div>
</template>
