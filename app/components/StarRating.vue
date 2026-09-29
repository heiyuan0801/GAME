<script setup lang="ts">
const props = withDefaults(
  defineProps<{ rating: number; size?: number; gap?: number }>(),
  { size: 13, gap: 1 },
)

const pct = computed(() => Math.max(0, Math.min(100, (props.rating / 5) * 100)))
const stars = [0, 1, 2, 3, 4]
</script>

<template>
  <span
    class="relative inline-flex align-middle"
    :style="{ gap: `${gap}px` }"
    :aria-label="`${rating} out of 5 stars`"
    role="img"
  >
    <!-- empty track -->
    <svg
      v-for="i in stars"
      :key="`e${i}`"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      class="text-[#d2d2d7]"
      fill="currentColor"
    >
      <path
        d="M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.6 6.2 20.7l1.1-6.5L2.6 9.6l6.5-.9z"
      />
    </svg>
    <!-- filled overlay -->
    <span
      class="pointer-events-none absolute inset-0 flex overflow-hidden"
      :style="{ width: `${pct}%`, gap: `${gap}px` }"
    >
      <svg
        v-for="i in stars"
        :key="`f${i}`"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        class="shrink-0 text-[#ff9500]"
        fill="currentColor"
      >
        <path
          d="M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.6 6.2 20.7l1.1-6.5L2.6 9.6l6.5-.9z"
        />
      </svg>
    </span>
  </span>
</template>
