<script setup lang="ts">
import { APPS, byChart, type AppItem } from '~/data/apps'

useHead({ title: 'Apps — App Store' })

const rail = byChart('free').slice(0, 8)

const groups = computed(() => {
  const byCat = (c: string) => APPS.filter((a) => a.category === c).slice(0, 6)
  return [
    { title: 'Editors’ Choice', apps: APPS.filter((a) => a.editors?.length).slice(0, 6) },
    { title: 'Get Things Done', apps: byCat('Productivity') },
    { title: 'Create and Edit', apps: byCat('Photo & Video') },
    { title: 'Stay Connected', apps: byCat('Social Networking') },
    { title: 'Tools for Every Day', apps: byCat('Utilities') },
    { title: 'Health and Wellbeing', apps: byCat('Health & Fitness') },
  ].filter((g) => g.apps.length)
})
</script>

<template>
  <div class="mx-auto max-w-[1180px] px-4 pt-6 pb-4 sm:px-6 sm:pt-8">
    <header class="mb-6">
      <h1 class="text-[32px] leading-none font-bold tracking-[-0.022em] sm:text-[40px]">Apps</h1>
      <p class="mt-2 max-w-[60ch] text-[14px] text-muted">
        Handpicked utilities, creative tools and the everyday essentials that Apple editors keep
        coming back to.
      </p>
    </header>

    <!-- Featured rail -->
    <section class="mb-11">
      <SectionHeading title="New and Noteworthy" :more="{ label: 'See all', to: '/charts' }" />
      <div class="scroller -mx-4 flex gap-4 px-4 pb-2 sm:mx-0 sm:px-0">
        <AppGridCard
          v-for="a in rail"
          :key="a.id"
          :app="a"
          class="w-[190px] shrink-0"
        />
      </div>
    </section>

    <section v-for="g in groups" :key="g.title" class="mb-10">
      <SectionHeading :title="g.title" />
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <AppGridCard v-for="a in g.apps" :key="a.id" :app="a" />
      </div>
    </section>
  </div>
</template>
