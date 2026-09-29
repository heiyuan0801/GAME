<script setup lang="ts">
import type { HeroCard } from '~/data/editorial'
import { byId } from '~/data/apps'

const props = defineProps<{ card: HeroCard }>()
const app = computed(() => byId(props.card.appId))
</script>

<template>
  <NuxtLink
    :to="`/app/${card.appId}`"
    class="group relative block h-[260px] overflow-hidden rounded-[26px] p-6 shadow-apple-card transition-transform duration-300 will-change-transform hover:-translate-y-0.5 sm:h-[300px] sm:p-7"
    :style="{ background: card.gradient }"
  >
    <!-- ambient glow -->
    <span class="pointer-events-none absolute inset-0" :style="{ background: card.glow }" />

    <!-- motif art -->
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMax slice"
      class="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <g v-if="card.motif === 'sasquatch'">
        <path d="M0 232c46-30 84-8 122-34s74-58 118-40 92 6 160-30v172H0Z" fill="#0b2416" opacity=".72" />
        <path d="M0 262c58-26 96-4 140-26s80-40 122-24 78 2 138-26v114H0Z" fill="#071a10" opacity=".85" />
        <circle cx="298" cy="86" r="30" fill="#9fe3b4" opacity=".22" />
        <path d="M296 66c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14Z" fill="#cdeed8" opacity=".55" />
        <path d="M310 78l16-6-14 12Z" fill="#cdeed8" opacity=".5" />
      </g>
      <g v-else-if="card.motif === 'highway'">
        <path d="M96 300 168 176h64l72 124z" fill="#08152b" opacity=".78" />
        <path d="M176 300 190 178h20l14 122z" fill="#9fc4ff" opacity=".3" />
        <g stroke="#9fc4ff" stroke-width="3.5" stroke-linecap="round" opacity=".36">
          <path d="M28 214h74M14 250h96M44 180h56" />
        </g>
        <g transform="translate(256 166)">
          <path d="M0 26 6 12c1-2.4 3.2-4 5.8-4h22.4c2.6 0 4.8 1.6 5.8 4l6 14z" fill="#dbe8ff" opacity=".5" />
          <rect x="-4" y="24" width="52" height="11" rx="5.5" fill="#dbe8ff" opacity=".5" />
          <circle cx="10" cy="36" r="5" fill="#08152b" />
          <circle cx="34" cy="36" r="5" fill="#08152b" />
        </g>
      </g>
      <g v-else-if="card.motif === 'wind'">
        <g fill="none" stroke="#c9b6ff" stroke-width="4" stroke-linecap="round" opacity=".4">
          <path d="M40 96c56-26 96 12 152-8s96-30 152-4" />
          <path d="M30 152c64-22 104 16 160-4s92-26 146-2" />
          <path d="M48 208c58-20 92 14 146-6s94-22 148 2" />
        </g>
      </g>
      <g v-else>
        <rect x="286" y="150" width="20" height="86" rx="8" fill="#ff8a8a" opacity=".3" />
        <rect x="266" y="150" width="18" height="86" rx="8" fill="#ff8a8a" opacity=".22" />
        <rect x="346" y="150" width="18" height="86" rx="8" fill="#ff8a8a" opacity=".22" />
        <rect x="324" y="150" width="20" height="86" rx="8" fill="#ff8a8a" opacity=".3" />
        <rect x="284" y="182" width="62" height="12" rx="6" fill="#ffb3b3" opacity=".45" />
      </g>
    </svg>

    <!-- eyebrow + title -->
    <div class="relative flex h-full flex-col">
      <p class="text-[12px] font-semibold tracking-[0.08em] text-white/70 uppercase">
        {{ card.eyebrow }}
      </p>
      <h3
        class="mt-2 max-w-[15ch] text-balance text-[27px] leading-[1.08] font-bold tracking-[-0.02em] text-white sm:text-[34px]"
      >
        {{ card.title }}
      </h3>

      <div class="flex-1" />

      <!-- app lockup strip -->
      <div class="-mx-6 -mb-6 flex items-center gap-3 bg-black/30 px-6 py-3.5 sm:-mx-7 sm:-mb-7 sm:px-7 frosted">
        <AppIcon v-if="app" :name="app.icon" :size="34" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-[13px] font-semibold text-white">{{ app?.name }}</p>
          <p class="truncate text-[11.5px] text-white/65">{{ card.note }}</p>
        </div>
        <span
          class="shrink-0 rounded-full bg-white/25 px-3.5 py-[5px] text-[12.5px] font-semibold text-white backdrop-blur transition group-hover:bg-white/40"
        >
          {{ card.cta }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
