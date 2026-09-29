<script setup lang="ts">
import { APPS } from '~/data/apps'
import { CATEGORY_GROUPS } from '~/data/editorial'

useHead({ title: 'Categories — App Store' })

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const tiles = CATEGORY_GROUPS.map((c) => ({
  ...c,
  count: APPS.filter((a) => a.category === c.name).length,
}))
</script>

<template>
  <div class="mx-auto max-w-[1180px] px-4 pt-6 pb-4 sm:px-6 sm:pt-8">
    <header class="mb-6">
      <h1 class="text-[32px] leading-none font-bold tracking-[-0.022em] sm:text-[40px]">
        Categories
      </h1>
      <p class="mt-2 max-w-[60ch] text-[14px] text-muted">
        Browse the storefront by what you want to do — from sharpening a skill to losing an
        afternoon.
      </p>
    </header>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <NuxtLink
        v-for="t in tiles"
        :key="t.name"
        :to="`/categories/${slug(t.name)}`"
        class="group relative overflow-hidden rounded-[18px] border border-hairline p-5 transition hover:-translate-y-0.5 hover:shadow-apple-card"
        :style="{ background: t.tint }"
      >
        <span class="text-[26px] leading-none">{{ t.glyph }}</span>
        <p class="mt-3 text-[15.5px] font-semibold tracking-[-0.012em]">{{ t.name }}</p>
        <p class="mt-0.5 text-[12px] text-muted">
          {{ t.count }} {{ t.count === 1 ? 'app' : 'apps' }}
        </p>
        <UiIcon
          name="arrowUpRight"
          :size="16"
          class="absolute top-4 right-4 text-ink/30 transition group-hover:text-ink/60"
        />
        <span
          class="pointer-events-none absolute -right-6 -bottom-8 h-24 w-24 rounded-full opacity-25"
          :style="{ background: t.accent }"
        />
      </NuxtLink>
    </div>
  </div>
</template>
