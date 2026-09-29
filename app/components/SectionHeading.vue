<script setup lang="ts">
defineProps<{
  title: string
  eyebrow?: string
  subtitle?: string
  /** trailing link */
  more?: { label: string; to: string }
  size?: 'md' | 'lg'
}>()
</script>

<template>
  <div class="mb-4 flex items-end justify-between gap-4">
    <div class="min-w-0">
      <p
        v-if="eyebrow"
        class="mb-1 text-[11px] font-semibold tracking-[0.06em] text-muted uppercase"
      >
        {{ eyebrow }}
      </p>
      <h2
        class="text-balance font-semibold tracking-[-0.018em]"
        :class="size === 'lg' ? 'text-[28px] leading-[1.15] sm:text-[34px]' : 'text-[21px] sm:text-[24px]'"
      >
        {{ title }}
      </h2>
      <p v-if="subtitle" class="mt-1 text-[13.5px] text-muted">{{ subtitle }}</p>
    </div>
    <NuxtLink
      v-if="more"
      :to="more.to"
      class="group inline-flex shrink-0 items-center gap-1 pb-1 text-[13.5px] font-medium text-blue transition hover:text-blue-hover"
    >
      {{ more.label }}
      <UiIcon
        name="chevronRight"
        :size="14"
        class="transition-transform group-hover:translate-x-0.5"
      />
    </NuxtLink>
  </div>
</template>
