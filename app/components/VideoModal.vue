<script setup lang="ts">
import type { AppVideo } from '~/data/apps'

const props = defineProps<{
  video: AppVideo | null
  videos: AppVideo[]
  appName: string
  appIcon?: string
}>()

const emit = defineEmits<{
  close: []
  select: [video: AppVideo]
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isFullscreen = ref(false)
const stageRef = ref<HTMLDivElement | null>(null)
const showControls = ref(true)
let hideTimer: any = null

const progressPercent = computed(() => {
  if (!duration.value) return 0
  return Math.min(100, (currentTime.value / duration.value) * 100)
})

function formatTime(sec: number) {
  const s = Math.floor(sec || 0)
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${rem.toString().padStart(2, '0')}`
}

function togglePlay() {
  if (!videoRef.value) return
  if (videoRef.value.paused) {
    videoRef.value.play().catch(() => {})
  } else {
    videoRef.value.pause()
  }
}

function toggleMute() {
  if (!videoRef.value) return
  videoRef.value.muted = !videoRef.value.muted
  isMuted.value = videoRef.value.muted
}

function onSeek(e: MouseEvent) {
  if (!videoRef.value || !duration.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const ratio = Math.max(0, Math.min(1, clickX / rect.width))
  videoRef.value.currentTime = ratio * duration.value
}

function onTimeUpdate() {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    duration.value = videoRef.value.duration || 0
  }
}

function onLoadedMetadata() {
  if (videoRef.value) {
    duration.value = videoRef.value.duration || 0
  }
}

function toggleFullscreen() {
  if (!stageRef.value) return
  if (!document.fullscreenElement) {
    stageRef.value.requestFullscreen().catch(() => {})
    isFullscreen.value = true
  } else {
    document.exitFullscreen().catch(() => {})
    isFullscreen.value = false
  }
}

function handleMouseMove() {
  showControls.value = true
  clearTimeout(hideTimer)
  if (isPlaying.value) {
    hideTimer = setTimeout(() => {
      showControls.value = false
    }, 2500)
  }
}

function onKey(e: KeyboardEvent) {
  if (!props.video) return
  if (e.key === 'Escape') {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      emit('close')
    }
  } else if (e.code === 'Space' || e.key === 'k') {
    e.preventDefault()
    togglePlay()
  } else if (e.key === 'm') {
    e.preventDefault()
    toggleMute()
  } else if (e.key === 'f') {
    e.preventDefault()
    toggleFullscreen()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    if (videoRef.value) videoRef.value.currentTime = Math.min(duration.value, currentTime.value + 5)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    if (videoRef.value) videoRef.value.currentTime = Math.max(0, currentTime.value - 5)
  }
}

let restoreOverflow = ''

watch(
  () => props.video,
  (v) => {
    if (!import.meta.client) return
    if (v) {
      restoreOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      nextTick(() => {
        if (videoRef.value) {
          videoRef.value.currentTime = 0
          videoRef.value.play().catch(() => {})
        }
      })
    } else {
      document.body.style.overflow = restoreOverflow
    }
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('keydown', onKey)
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (import.meta.client) document.body.style.overflow = restoreOverflow
  clearTimeout(hideTimer)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="video"
        class="fixed inset-0 z-[110] flex flex-col bg-black/90 backdrop-blur-2xl"
        role="dialog"
        aria-modal="true"
        :aria-label="`${video.title} - Video Preview`"
        @click.self="emit('close')"
      >
        <!-- Top bar -->
        <header
          class="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6"
        >
          <div class="flex min-w-0 items-center gap-3">
            <AppIcon
              v-if="appIcon"
              :name="appIcon"
              :size="36"
              radius="22.37%"
              class="shrink-0"
            />
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span
                  v-if="video.badge"
                  class="rounded-[4px] bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold text-white/90 uppercase tracking-wider"
                >
                  {{ video.badge }}
                </span>
                <p class="truncate text-[14px] font-semibold text-white">{{ appName }}</p>
              </div>
              <p class="truncate text-[12px] text-white/70">{{ video.title }}</p>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-full bg-white/12 text-white transition hover:bg-white/25 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
              aria-label="Close video preview"
              @click="emit('close')"
            >
              <UiIcon name="close" :size="18" />
            </button>
          </div>
        </header>

        <!-- Stage Area -->
        <main
          class="relative flex min-h-0 flex-1 items-center justify-center p-3 sm:p-6"
          @mousemove="handleMouseMove"
        >
          <div
            ref="stageRef"
            class="group relative flex max-h-full w-full max-w-[960px] items-center justify-center overflow-hidden rounded-[20px] bg-black shadow-2xl"
          >
            <!-- Native Video Element -->
            <video
              ref="videoRef"
              :src="video.url"
              playsinline
              preload="auto"
              class="max-h-[72vh] w-full object-contain cursor-pointer"
              @click="togglePlay"
              @play="isPlaying = true"
              @pause="isPlaying = false"
              @timeupdate="onTimeUpdate"
              @loadedmetadata="onLoadedMetadata"
              @ended="isPlaying = false"
            />

            <!-- Big Center Play Button when paused -->
            <Transition
              enter-active-class="transition duration-150 ease-out"
              leave-active-class="transition duration-100 ease-in"
              enter-from-class="scale-90 opacity-0"
              leave-to-class="scale-90 opacity-0"
            >
              <button
                v-if="!isPlaying"
                type="button"
                class="absolute inset-0 m-auto grid h-18 w-18 place-items-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-2xl transition hover:scale-105 active:scale-95"
                aria-label="Play video"
                @click="togglePlay"
              >
                <UiIcon name="play" :size="32" fill class="ml-1" />
              </button>
            </Transition>

            <!-- Video Controls Bar -->
            <div
              class="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 transition-opacity duration-300"
              :class="showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            >
              <!-- Progress Bar -->
              <div
                class="relative h-2 w-full cursor-pointer rounded-full bg-white/25 transition-all hover:h-2.5"
                role="slider"
                :aria-valuenow="Math.round(progressPercent)"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label="Video timeline progress"
                @click="onSeek"
              >
                <div
                  class="absolute top-0 left-0 h-full rounded-full bg-blue transition-all"
                  :style="{ width: `${progressPercent}%` }"
                />
                <div
                  class="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-md transition-opacity"
                  :style="{ left: `${progressPercent}%` }"
                />
              </div>

              <!-- Controls lockup -->
              <div class="flex items-center justify-between gap-4 text-white">
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    class="grid h-8 w-8 place-items-center rounded-full text-white/90 hover:bg-white/15 hover:text-white transition"
                    :aria-label="isPlaying ? 'Pause' : 'Play'"
                    @click="togglePlay"
                  >
                    <UiIcon :name="isPlaying ? 'pause' : 'play'" :size="18" fill />
                  </button>

                  <button
                    type="button"
                    class="grid h-8 w-8 place-items-center rounded-full text-white/90 hover:bg-white/15 hover:text-white transition"
                    :aria-label="isMuted ? 'Unmute' : 'Mute'"
                    @click="toggleMute"
                  >
                    <UiIcon :name="isMuted ? 'volumeMute' : 'volume'" :size="18" />
                  </button>

                  <span class="text-[12px] font-medium tracking-tight text-white/80 tabular-nums">
                    {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="grid h-8 w-8 place-items-center rounded-full text-white/90 hover:bg-white/15 hover:text-white transition"
                    :aria-label="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
                    @click="toggleFullscreen"
                  >
                    <UiIcon :name="isFullscreen ? 'fullscreenExit' : 'fullscreen'" :size="18" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- Playlist selector if multiple videos exist -->
        <footer
          v-if="videos.length > 1"
          class="shrink-0 border-t border-white/10 px-4 py-3 sm:px-6"
        >
          <div class="mx-auto flex max-w-[960px] items-center justify-center gap-3 overflow-x-auto">
            <button
              v-for="v in videos"
              :key="v.id"
              type="button"
              class="flex items-center gap-2.5 rounded-[12px] border px-3 py-1.5 transition text-left"
              :class="
                v.id === video.id
                  ? 'border-blue bg-blue/15 text-white'
                  : 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              "
              @click="emit('select', v)"
            >
              <UiIcon name="video" :size="16" class="text-blue shrink-0" />
              <div class="min-w-0">
                <p class="truncate text-[12.5px] font-semibold leading-tight">{{ v.title }}</p>
                <p class="text-[10.5px] text-white/50 leading-tight">{{ v.duration }}</p>
              </div>
            </button>
          </div>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>
