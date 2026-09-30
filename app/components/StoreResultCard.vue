<script setup lang="ts">
defineProps<{ result: StoreResult }>()

const failed = ref(false)
</script>

<template>
  <a
    :href="result.url"
    target="_blank"
    rel="noopener noreferrer"
    class="group flex flex-col gap-2.5 rounded-[18px] border border-hairline bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-apple-card"
  >
    <img
      v-if="!failed"
      :src="result.icon"
      :alt="`${result.name} app icon`"
      width="62"
      height="62"
      loading="lazy"
      decoding="async"
      class="h-[62px] w-[62px] shrink-0 object-cover"
      style="border-radius: 22.37%"
      @error="failed = true"
    />
    <AppIcon v-else name="appstore" :size="62" />

    <div class="min-w-0">
      <p class="truncate text-[14.5px] font-medium tracking-[-0.008em]">{{ result.name }}</p>
      <p class="truncate text-[12px] text-muted">{{ result.category }}</p>
    </div>

    <div class="mt-auto flex items-center justify-between gap-2 pt-1">
      <span class="flex min-w-0 items-center gap-1.5">
        <StarRating :rating="result.rating" :size="11" />
        <span class="text-[11.5px] text-muted tabular-nums">{{ compactCount(result.ratingsCount) }}</span>
      </span>
      <span
        class="shrink-0 rounded-full bg-fill px-3.5 py-[4px] text-[12px] font-semibold text-link transition group-hover:bg-fill-strong"
      >
        {{ result.price === 'Free' ? 'GET' : result.price }}
      </span>
    </div>
  </a>
</template>
