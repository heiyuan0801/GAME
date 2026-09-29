<script setup lang="ts">
import type { ChartEntry } from '#shared/types/store'

defineProps<{ entry: ChartEntry }>()

const failed = ref(false)
</script>

<template>
  <a
    :href="entry.url"
    target="_blank"
    rel="noopener noreferrer"
    :title="`Open ${entry.name} on the App Store`"
    class="group flex items-center gap-3 rounded-[12px] px-2 py-2 transition hover:bg-fill-subtle"
  >
    <span class="w-5 shrink-0 text-center text-[15px] font-medium tabular-nums text-ink/70">
      {{ entry.rank }}
    </span>

    <img
      v-if="!failed && entry.icon"
      :src="entry.icon"
      :alt="`${entry.name} app icon`"
      width="56"
      height="56"
      loading="lazy"
      decoding="async"
      class="h-14 w-14 shrink-0 object-cover"
      style="border-radius: 22.37%"
      @error="failed = true"
    />
    <AppIcon v-else name="appstore" :size="56" />

    <div class="min-w-0 flex-1">
      <p class="truncate text-[14.5px] font-medium tracking-[-0.008em]">{{ entry.name }}</p>
      <p class="truncate text-[12.5px] text-muted">{{ entry.developer }}</p>
      <div class="mt-0.5 flex items-center gap-1.5">
        <StarRating :rating="entry.rating" :size="11" />
        <span class="text-[11.5px] text-muted tabular-nums">
          {{ compactCount(entry.ratingsCount) }}
        </span>
      </div>
    </div>

    <div class="flex shrink-0 flex-col items-end gap-1.5">
      <span
        class="rounded-full bg-blue px-4 py-[5px] text-[12.5px] font-semibold text-white transition group-hover:bg-blue-hover"
      >
        {{ entry.price === 'Free' ? 'GET' : entry.price }}
      </span>
      <span class="flex items-center gap-1 text-[11px] whitespace-nowrap text-muted">
        {{ entry.priceNote }}
        <UiIcon name="arrowUpRight" :size="10" class="opacity-0 transition group-hover:opacity-100" />
      </span>
    </div>
  </a>
</template>
