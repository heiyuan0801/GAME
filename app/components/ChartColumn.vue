<script setup lang="ts">
/**
 * Card shell for one top-charts column. Shared by the curated and the live
 * grids so the two stay pixel-identical; `loading` swaps the slot for
 * skeleton rows while a feed is in flight.
 */
withDefaults(defineProps<{ title: string; note: string; loading?: boolean; rows?: number }>(), {
  loading: false,
  rows: 8,
})
</script>

<template>
  <div class="rounded-[22px] bg-card p-3.5 shadow-apple-card sm:p-4">
    <header class="mb-2 flex items-center justify-between gap-2 px-2">
      <h2 class="flex items-center gap-1.5 text-[15.5px] font-semibold tracking-[-0.012em]">
        <span class="h-1.5 w-1.5 rounded-full bg-blue" />
        {{ title }}
      </h2>
      <span class="text-[11px] whitespace-nowrap text-muted">{{ note }}</span>
    </header>

    <div v-if="loading" class="space-y-0.5" aria-hidden="true">
      <div v-for="i in rows" :key="i" class="flex items-center gap-3 px-2 py-2">
        <span class="h-3.5 w-4 shrink-0 animate-pulse rounded bg-fill" />
        <span class="h-14 w-14 shrink-0 animate-pulse rounded-[12px] bg-fill" />
        <div class="min-w-0 flex-1 space-y-2">
          <span class="block h-3.5 w-2/3 animate-pulse rounded bg-fill" />
          <span class="block h-3 w-1/3 animate-pulse rounded bg-fill" />
        </div>
        <span class="h-7 w-16 shrink-0 animate-pulse rounded-full bg-fill" />
      </div>
    </div>

    <slot v-else />
  </div>
</template>
