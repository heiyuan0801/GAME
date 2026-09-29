<script setup lang="ts">
import type { AppItem, AppVideo } from '~/data/apps'

const props = defineProps<{
  app: AppItem
  videos: AppVideo[]
}>()

const activeVideo = ref<AppVideo | null>(null)
const inlinePlayingId = ref<string | null>(null)
const videoEls = ref<Record<string, HTMLVideoElement>>({})

function setVideoRef(el: any, id: string) {
  if (el) {
    videoEls.value[id] = el as HTMLVideoElement
  }
}

function openModal(video: AppVideo) {
  // Pause any currently playing inline video first
  if (inlinePlayingId.value && videoEls.value[inlinePlayingId.value]) {
    videoEls.value[inlinePlayingId.value].pause()
    inlinePlayingId.value = null
  }
  activeVideo.value = video
}

function toggleInlinePlay(video: AppVideo, e?: Event) {
  if (e) e.stopPropagation()
  const el = videoEls.value[video.id]
  if (!el) return

  if (inlinePlayingId.value === video.id) {
    el.pause()
    inlinePlayingId.value = null
  } else {
    // Pause other videos
    if (inlinePlayingId.value && videoEls.value[inlinePlayingId.value]) {
      videoEls.value[inlinePlayingId.value].pause()
    }
    el.play().catch(() => {
      // If inline play is prevented or fails, fall back to modal
      openModal(video)
    })
    inlinePlayingId.value = video.id
  }
}

function onInlineEnded(id: string) {
  if (inlinePlayingId.value === id) {
    inlinePlayingId.value = null
  }
}
</script>

<template>
  <section class="mt-10" aria-label="Video previews">
    <!-- Header -->
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-[21px] font-semibold tracking-[-0.016em]">Video Preview</h2>
          <span
            v-if="videos.length > 1"
            class="rounded-full bg-fill px-2.5 py-0.5 text-[11px] font-semibold text-muted"
          >
            {{ videos.length }} Videos
          </span>
        </div>
        <p class="mt-0.5 text-[12.5px] text-muted">
          Watch official feature previews and gameplay walkthroughs
        </p>
      </div>

      <div class="flex items-center gap-2 text-[12px] text-muted">
        <span class="inline-flex items-center gap-1">
          <UiIcon name="video" :size="14" class="text-blue" />
          HD 60fps
        </span>
      </div>
    </div>

    <!-- Video Cards Container -->
    <div
      class="grid gap-5"
      :class="videos.length === 1 ? 'max-w-[880px]' : 'sm:grid-cols-2'"
    >
      <article
        v-for="v in videos"
        :key="v.id"
        class="group relative flex flex-col overflow-hidden rounded-[20px] border border-hairline bg-card shadow-apple-card transition duration-200 hover:shadow-apple-float"
      >
        <!-- Video Stage Screen -->
        <div class="relative aspect-[16/9] w-full overflow-hidden bg-black">
          <!-- Video element -->
          <video
            :ref="(el) => setVideoRef(el, v.id)"
            :src="v.url"
            playsinline
            preload="metadata"
            class="h-full w-full object-cover"
            @ended="onInlineEnded(v.id)"
            @click="toggleInlinePlay(v)"
          />

          <!-- Ambient Backdrop Gradient & Vignette -->
          <div
            v-if="inlinePlayingId !== v.id"
            class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20"
          />

          <!-- Top Badges -->
          <div
            class="absolute top-3 inset-x-3.5 flex items-center justify-between pointer-events-none transition-opacity duration-200"
            :class="inlinePlayingId === v.id ? 'opacity-0' : 'opacity-100'"
          >
            <span
              v-if="v.badge"
              class="rounded-[6px] bg-black/60 px-2 py-0.5 text-[10.5px] font-semibold tracking-wider text-white uppercase backdrop-blur-md border border-white/10"
            >
              {{ v.badge }}
            </span>
            <span
              class="rounded-[6px] bg-black/60 px-2 py-0.5 text-[10.5px] font-semibold text-white/90 backdrop-blur-md border border-white/10 tabular-nums"
            >
              {{ v.duration }}
            </span>
          </div>

          <!-- Center Play / Pause Button Overlay -->
          <div
            class="absolute inset-0 grid place-items-center cursor-pointer"
            @click="toggleInlinePlay(v)"
          >
            <button
              type="button"
              class="grid h-13 w-13 place-items-center rounded-full bg-white/25 text-white backdrop-blur-md border border-white/30 shadow-apple-float transition duration-200 group-hover:scale-110 group-hover:bg-white/35 active:scale-95"
              :aria-label="inlinePlayingId === v.id ? `Pause ${v.title}` : `Play ${v.title}`"
              @click.stop="toggleInlinePlay(v, $event)"
            >
              <UiIcon
                :name="inlinePlayingId === v.id ? 'pause' : 'play'"
                :size="24"
                fill
                :class="inlinePlayingId === v.id ? '' : 'ml-0.5'"
              />
            </button>
          </div>

          <!-- Quick Action Buttons on Hover -->
          <div
            class="absolute bottom-3 right-3 flex items-center gap-1.5 transition duration-200"
            :class="inlinePlayingId === v.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
          >
            <!-- Cinema Mode Button -->
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white/90 backdrop-blur-md border border-white/15 transition hover:bg-black/80 hover:text-white"
              title="Open Cinema Player"
              aria-label="Open Cinema Player"
              @click.stop="openModal(v)"
            >
              <UiIcon name="expand" :size="15" />
            </button>
          </div>
        </div>

        <!-- Video Card Meta Footer -->
        <div class="flex flex-1 flex-col justify-between p-4">
          <div>
            <h3 class="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">
              {{ v.title }}
            </h3>
            <p class="mt-1 text-[12.5px] leading-relaxed text-muted">
              {{ v.caption }}
            </p>
          </div>

          <div class="mt-3.5 flex items-center justify-between border-t border-hairline/60 pt-2.5">
            <span class="text-[11.5px] font-medium text-muted">
              {{ app.name }} · {{ app.developer }}
            </span>
            <button
              type="button"
              class="text-[12.5px] font-medium text-blue hover:underline inline-flex items-center gap-1"
              @click="openModal(v)"
            >
              Cinema Mode
              <UiIcon name="arrowRight" :size="12" />
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Fullscreen Cinema Modal -->
    <VideoModal
      :video="activeVideo"
      :videos="videos"
      :app-name="app.name"
      :app-icon="app.icon"
      @close="activeVideo = null"
      @select="activeVideo = $event"
    />
  </section>
</template>
