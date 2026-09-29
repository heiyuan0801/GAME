<script setup lang="ts">
import type { AppItem } from '~/data/apps'

defineProps<{ app: AppItem; rank: number }>()
</script>

<template>
  <NuxtLink
    :to="`/app/${app.id}`"
    class="group flex items-center gap-3 rounded-[12px] px-2 py-2 transition hover:bg-fill-subtle"
  >
    <span
      class="w-5 shrink-0 text-center text-[15px] font-medium tabular-nums text-ink/70"
    >
      {{ rank }}
    </span>

    <AppIcon :name="app.icon" :size="56" />

    <div class="min-w-0 flex-1">
      <p class="truncate text-[14.5px] font-medium tracking-[-0.008em]">{{ app.name }}</p>
      <p class="truncate text-[12.5px] text-muted">{{ app.developer }}</p>
      <div class="mt-0.5 flex items-center gap-1.5">
        <StarRating :rating="app.rating" :size="11" />
        <span class="text-[11.5px] text-muted tabular-nums">{{ app.ratingsCount }}</span>
      </div>
    </div>

    <div class="flex shrink-0 flex-col items-end gap-1.5">
      <GetButton :app="app" size="sm" />
      <span class="text-[11px] whitespace-nowrap text-muted">{{ app.priceNote }}</span>
    </div>
  </NuxtLink>
</template>
