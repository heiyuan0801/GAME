<script setup lang="ts">
import type { AppItem } from '~/data/apps'

const props = withDefaults(
  defineProps<{ app: AppItem; rank?: number; showRating?: boolean; dense?: boolean }>(),
  { showRating: true },
)
</script>

<template>
  <NuxtLink
    :to="`/app/${app.id}`"
    class="group flex items-center gap-3 rounded-[12px] px-2 transition hover:bg-fill-subtle"
    :class="dense ? 'py-1.5' : 'py-2'"
  >
    <span
      v-if="rank != null"
      class="w-5 shrink-0 text-center text-[15px] font-medium tabular-nums text-ink/70"
    >
      {{ rank }}
    </span>

    <AppIcon :name="app.icon" :size="dense ? 44 : 54" />

    <div class="min-w-0 flex-1">
      <p class="truncate text-[14.5px] font-medium tracking-[-0.008em]">{{ app.name }}</p>
      <p class="truncate text-[12.5px] text-muted">{{ app.tagline }}</p>
      <div v-if="showRating" class="mt-0.5 flex items-center gap-1.5">
        <StarRating :rating="app.rating" :size="11" />
        <span class="text-[11.5px] text-muted tabular-nums">{{ app.ratingsCount }}</span>
      </div>
    </div>

    <span
      class="shrink-0 rounded-full bg-fill px-4 py-[5px] text-[12.5px] font-semibold text-link transition group-hover:bg-fill-strong"
    >
      {{ app.price === 'Free' ? 'GET' : app.price }}
    </span>
  </NuxtLink>
</template>
