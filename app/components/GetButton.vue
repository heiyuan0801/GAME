<script setup lang="ts">
import type { AppItem } from '~/data/apps'

const props = withDefaults(
  defineProps<{
    app: AppItem
    size?: 'sm' | 'md' | 'lg'
    full?: boolean
    tone?: 'blue' | 'muted'
  }>(),
  { size: 'md', full: false, tone: 'blue' },
)

/**
 * Simulated install lifecycle so the storefront feels alive.
 * idle -> installing (progress ring) -> open
 */
const state = ref<'idle' | 'installing' | 'open'>('idle')
const progress = ref(0)
let raf: number | null = null

const label = computed(() => {
  if (state.value === 'open') return 'OPEN'
  if (state.value === 'installing') return ''
  return props.app.price === 'Free' ? 'GET' : props.app.price.replace('$', '$')
})

function tick() {
  progress.value = Math.min(100, progress.value + 3.2 + Math.random() * 4)
  if (progress.value >= 100) {
    state.value = 'open'
    progress.value = 100
    return
  }
  raf = requestAnimationFrame(tick)
}

function start() {
  if (state.value !== 'idle') return
  state.value = 'installing'
  progress.value = 0
  raf = requestAnimationFrame(tick)
}

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
})

const dims = computed(() =>
  props.size === 'sm'
    ? 'h-7 min-w-[64px] px-4 text-[12px]'
    : props.size === 'lg'
      ? 'h-9 min-w-[86px] px-6 text-[15px]'
      : 'h-7.5 min-w-[74px] px-5 text-[13px]',
)

const R = 9
const C = 2 * Math.PI * R
</script>

<template>
  <button
    type="button"
    :class="[
      'relative inline-flex items-center justify-center rounded-full font-semibold tracking-[0.01em] transition select-none',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
      dims,
      full ? 'w-full' : '',
      state === 'open'
        ? 'bg-transparent text-blue hover:bg-fill'
        : tone === 'muted'
          ? 'bg-fill text-blue hover:bg-fill-strong'
          : 'bg-blue text-white hover:bg-blue-hover active:scale-[.97]',
    ]"
    :aria-label="`${label || 'Installing'} ${app.name}`"
    @click.stop.prevent="start"
  >
    <template v-if="state === 'installing'">
      <svg width="22" height="22" viewBox="0 0 22 22" class="-m-0.5">
        <circle cx="11" cy="11" :r="R" fill="none" stroke="currentColor" stroke-width="2" opacity=".22" />
        <circle
          cx="11"
          cy="11"
          :r="R"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          :stroke-dasharray="C"
          :stroke-dashoffset="C * (1 - progress / 100)"
          transform="rotate(-90 11 11)"
        />
      </svg>
    </template>
    <template v-else>
      {{ label }}
    </template>
  </button>
</template>
