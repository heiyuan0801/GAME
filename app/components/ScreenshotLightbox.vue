<script setup lang="ts">
import type { Shot } from '~/data/apps'

const props = defineProps<{
  shots: Shot[]
  appName: string
  index: number | null
}>()

const emit = defineEmits<{ close: []; 'update:index': [number] }>()

const open = computed(() => props.index !== null)
const current = computed(() => (props.index === null ? null : (props.shots[props.index] ?? null)))

function go(delta: number) {
  if (props.index === null || !props.shots.length) return
  const n = props.shots.length
  emit('update:index', (props.index + delta + n) % n)
}

function onKey(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'Escape') emit('close')
  else if (e.key === 'ArrowRight') go(1)
  else if (e.key === 'ArrowLeft') go(-1)
}

let restoreOverflow = ''

watch(open, (v) => {
  if (!import.meta.client) return
  if (v) {
    restoreOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = restoreOverflow
  }
})

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (import.meta.client) document.body.style.overflow = restoreOverflow
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open && current"
        class="fixed inset-0 z-[100] flex flex-col bg-black/80 frosted"
        role="dialog"
        aria-modal="true"
        :aria-label="`${appName} screenshots`"
        @click.self="emit('close')"
      >
        <!-- Top bar -->
        <div class="flex shrink-0 items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div class="min-w-0">
            <p class="truncate text-[14px] font-semibold text-white">{{ appName }}</p>
            <p class="truncate text-[12px] text-white/60">{{ current.caption }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-3">
            <span class="text-[12.5px] text-white/70 tabular-nums">
              {{ (index ?? 0) + 1 }} / {{ shots.length }}
            </span>
            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-full bg-white/12 text-white transition hover:bg-white/25"
              aria-label="Close"
              @click="emit('close')"
            >
              <UiIcon name="close" :size="18" />
            </button>
          </div>
        </div>

        <!-- Stage -->
        <div class="relative flex min-h-0 flex-1 items-center justify-center px-14 pb-6 sm:px-20">
          <button
            v-if="shots.length > 1"
            type="button"
            class="absolute left-2 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white transition hover:bg-white/25 sm:left-5"
            aria-label="Previous screenshot"
            @click="go(-1)"
          >
            <UiIcon name="chevronLeft" :size="20" />
          </button>

          <MockScreen :shot="current" :width="300" />

          <button
            v-if="shots.length > 1"
            type="button"
            class="absolute right-2 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white transition hover:bg-white/25 sm:right-5"
            aria-label="Next screenshot"
            @click="go(1)"
          >
            <UiIcon name="chevronRight" :size="20" />
          </button>
        </div>

        <!-- Thumbnails: real scaled-down screens, not placeholders -->
        <div
          v-if="shots.length > 1"
          class="no-scrollbar flex shrink-0 justify-center gap-2.5 overflow-x-auto px-4 pb-5"
        >
          <button
            v-for="(s, i) in shots"
            :key="i"
            type="button"
            class="relative h-[58px] w-[29px] shrink-0 overflow-hidden rounded-[6px] border-2 transition"
            :class="i === index ? 'border-white' : 'border-white/20 opacity-60 hover:opacity-100'"
            :aria-label="`Screenshot ${i + 1}: ${s.caption}`"
            @click="emit('update:index', i)"
          >
            <span class="pointer-events-none absolute top-0 left-0 origin-top-left" style="transform: scale(0.139)">
              <MockScreen :shot="s" :width="208" />
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
