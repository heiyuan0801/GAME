<script setup lang="ts">
import type { AppItem } from '~/data/apps'

defineProps<{ app: AppItem }>()
</script>

<template>
  <NuxtLink
    :to="`/app/${app.id}`"
    class="group flex flex-col gap-2.5 rounded-[18px] border border-hairline bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-apple-card"
  >
    <AppIcon :name="app.icon" :size="62" />
    <div class="min-w-0">
      <p class="truncate text-[14.5px] font-medium tracking-[-0.008em]">{{ app.name }}</p>
      <p class="truncate text-[12px] text-muted">{{ app.category }}</p>
    </div>
    <div class="mt-auto flex items-center justify-between gap-2 pt-1">
      <span class="flex items-center gap-1.5">
        <StarRating :rating="app.rating" :size="11" />
        <span class="text-[11.5px] text-muted tabular-nums">{{ app.rating.toFixed(1) }}</span>
      </span>
      <span
        class="rounded-full bg-fill px-3.5 py-[4px] text-[12px] font-semibold text-blue transition group-hover:bg-fill-strong"
      >
        {{ app.price === 'Free' ? 'GET' : app.price }}
      </span>
    </div>
  </NuxtLink>
</template>
