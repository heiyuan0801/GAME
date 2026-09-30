<script setup lang="ts">
import type { Review } from '~/data/apps'

const props = defineProps<{ review: Review }>()
const expanded = ref(false)

const isLong = computed(() => props.review.body.length > 190)
const shown = computed(() =>
  expanded.value || !isLong.value ? props.review.body : props.review.body.slice(0, 190) + '…',
)
</script>

<template>
  <article class="border-t border-hairline pt-5 first:border-t-0 first:pt-0">
    <div class="flex items-center justify-between gap-3">
      <StarRating :rating="review.rating" :size="12" />
      <span class="text-[12.5px] text-muted">{{ review.date }}</span>
    </div>

    <h3 class="mt-2 text-[15px] font-semibold tracking-[-0.008em]">{{ review.title }}</h3>
    <p class="mt-1.5 text-[13.5px] leading-[1.55] text-ink/85">
      {{ shown }}
      <button
        v-if="isLong && !expanded"
        type="button"
        class="font-medium text-link hover:underline"
        @click="expanded = true"
      >
        more
      </button>
    </p>

    <p class="mt-2.5 text-[12.5px] text-muted">
      {{ review.author }}
      <span class="mx-1">·</span>
      <span class="inline-flex items-center gap-1">
        <UiIcon name="check" :size="11" class="text-blue" />
        Helpful?
      </span>
      <button type="button" class="ml-1 font-medium text-link hover:underline">Yes</button>
      <span class="mx-1">·</span>
      <span class="tabular-nums">{{ review.helpful }}</span>
    </p>

    <!-- Developer response -->
    <div
      v-if="review.response"
      class="mt-3.5 rounded-[14px] border-l-[3px] border-blue/40 bg-recess p-3.5"
    >
      <div class="flex items-center justify-between gap-3">
        <p class="flex items-center gap-1.5 text-[12.5px] font-semibold">
          <UiIcon name="shield" :size="13" class="text-blue" />
          Developer Response
        </p>
        <span class="text-[11.5px] text-muted">{{ review.response.date }}</span>
      </div>
      <p class="mt-1.5 text-[13px] leading-[1.5] text-ink/80">{{ review.response.body }}</p>
    </div>
  </article>
</template>
