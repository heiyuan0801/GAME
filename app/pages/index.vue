<script setup lang="ts">
import { TODAY_HEROES, TODAY_PANELS, TODAY_EVENTS, TODAY_FEATURES } from '~/data/editorial'
import { byId, type AppItem } from '~/data/apps'

useHead({ title: 'App Store — Today' })

const dateLabel = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(new Date())

const panelApps = (ids: string[]) => ids.map(byId).filter((a): a is AppItem => !!a)
</script>

<template>
  <div class="mx-auto max-w-[1180px] px-4 pt-6 pb-4 sm:px-6 sm:pt-8">
    <!-- Page title -->
    <header class="mb-5">
      <h1 class="text-[32px] leading-none font-bold tracking-[-0.022em] sm:text-[40px]">Today</h1>
      <p class="mt-2 text-[13.5px] text-muted">{{ dateLabel }}</p>
    </header>

    <!-- Hero pair -->
    <section class="grid gap-4 lg:grid-cols-2">
      <HeroCard v-for="h in TODAY_HEROES" :key="h.id" :card="h" :level="2" />
    </section>

    <!-- Biggest apps and games -->
    <section class="mt-11">
      <SectionHeading title="The Biggest Apps and Games" />
      <div class="grid gap-4 lg:grid-cols-2">
        <PanelCard
          v-for="p in TODAY_PANELS"
          :key="p.title"
          :eyebrow="p.eyebrow"
          :title="p.title"
          :to="p.href"
        >
          <AppRow
            v-for="a in panelApps(p.appIds)"
            :key="a.id"
            :app="a"
            dense
            :show-rating="false"
          />
        </PanelCard>
      </div>
    </section>

    <!-- In-app events -->
    <section class="mt-11">
      <SectionHeading title="Today’s In-App Events" />
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <EventCard v-for="e in TODAY_EVENTS" :key="e.id" :card="e" />
      </div>
    </section>

    <!-- Editors' favorites -->
    <section class="mt-11">
      <SectionHeading
        title="App Store Editors’ Favorites"
        subtitle="We enjoy apps and games we recommend"
      />
      <div class="grid gap-4 lg:grid-cols-2">
        <FeatureCard v-for="f in TODAY_FEATURES" :key="f.id" :card="f" />
      </div>
    </section>
  </div>
</template>
