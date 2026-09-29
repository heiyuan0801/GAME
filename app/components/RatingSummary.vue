<script setup lang="ts">
import { ratingBars, type AppItem } from '~/data/apps'

const props = defineProps<{ app: AppItem }>()
const bars = computed(() => ratingBars(props.app))
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-[170px_1fr] sm:gap-8">
    <!-- Score lockup -->
    <div class="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-2">
      <p class="text-[46px] leading-none font-bold tracking-[-0.03em] tabular-nums">
        {{ app.rating.toFixed(1) }}
      </p>
      <div>
        <StarRating :rating="app.rating" :size="14" />
        <p class="mt-1 text-[12.5px] text-muted">
          {{ app.ratingsCount }} Ratings
        </p>
      </div>
    </div>

    <!-- Distribution -->
    <div class="space-y-[7px] self-center">
      <div v-for="(v, i) in bars" :key="i" class="flex items-center gap-3">
        <span class="w-8 shrink-0 text-[11.5px] font-medium text-muted tabular-nums">
          {{ 5 - i }} ★
        </span>
        <span class="h-[7px] flex-1 overflow-hidden rounded-full bg-hairline">
          <span
            class="block h-full rounded-full bg-muted transition-[width] duration-700"
            :style="{ width: `${(v * 100).toFixed(1)}%` }"
          />
        </span>
      </div>
    </div>
  </div>
</template>
