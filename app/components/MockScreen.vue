<script setup lang="ts">
import type { Shot } from '~/data/apps'

const props = withDefaults(defineProps<{ shot: Shot; width?: number }>(), { width: 208 })

const accent = computed(() => props.shot.tint)
const h = computed(() => Math.round(props.width * 2.03))
</script>

<template>
  <figure class="shrink-0" :style="{ width: `${width}px` }">
    <div
      class="relative rounded-[30px] border border-hairline bg-card p-[6px] shadow-apple-card"
      :style="{ height: `${h}px` }"
    >
      <!-- The simulated screen stays light in both themes: it stands in for a
           real screenshot image, exactly like the live storefront. -->
      <div class="mock-screen relative h-full w-full overflow-hidden rounded-[24px]">
        <!-- dynamic island -->
        <div
          class="absolute top-1.5 left-1/2 z-20 h-[13px] w-[52px] -translate-x-1/2 rounded-full bg-black/85"
        />

        <!-- ---------------- chat ---------------- -->
        <div v-if="shot.kind === 'chat'" class="flex h-full flex-col">
          <div class="flex items-center gap-2 px-3 pt-6 pb-2">
            <span class="h-5 w-5 rounded-full" :style="{ background: accent }" />
            <span class="h-2 w-16 rounded-full bg-black/12" />
          </div>
          <div class="flex-1 space-y-2 px-3">
            <div class="ml-auto h-8 w-[74%] rounded-[12px] rounded-br-[4px] bg-black/[.07]" />
            <div class="h-14 w-[88%] rounded-[12px] rounded-bl-[4px]" :style="{ background: `${accent}22` }" />
            <div class="ml-auto h-10 w-[62%] rounded-[12px] rounded-br-[4px] bg-black/[.07]" />
            <div class="h-20 w-[92%] rounded-[12px] rounded-bl-[4px]" :style="{ background: `${accent}18` }" />
          </div>
          <div class="m-3 flex items-center gap-2 rounded-full border border-hairline px-3 py-2">
            <span class="h-2 w-16 rounded-full bg-black/10" />
            <span class="ml-auto h-4 w-4 rounded-full" :style="{ background: accent }" />
          </div>
        </div>

        <!-- ---------------- gallery ---------------- -->
        <div v-else-if="shot.kind === 'gallery'" class="h-full pt-6">
          <div class="flex gap-2 px-3 pb-2">
            <span class="h-2 w-12 rounded-full bg-black/12" />
            <span class="h-2 w-8 rounded-full bg-black/08" />
          </div>
          <div class="grid grid-cols-2 gap-2 px-3">
            <div
              v-for="i in 6"
              :key="i"
              class="rounded-[12px]"
              :style="{
                height: i % 3 === 0 ? '86px' : '66px',
                background: `linear-gradient(150deg, ${accent}${i % 2 ? 'cc' : '77'}, ${accent}33)`,
              }"
            />
          </div>
        </div>

        <!-- ---------------- stats ---------------- -->
        <div v-else-if="shot.kind === 'stats'" class="h-full px-4 pt-8">
          <div class="mx-auto grid h-24 w-24 place-items-center rounded-full"
               :style="{ background: `conic-gradient(${accent} 0 68%, #00000012 68% 100%)` }">
            <span class="grid h-16 w-16 place-items-center rounded-full bg-white text-[15px] font-bold">
              68%
            </span>
          </div>
          <div class="mt-5 space-y-2.5">
            <div v-for="i in 4" :key="i" class="flex items-center gap-2">
              <span class="h-1.5 w-8 rounded-full bg-black/10" />
              <span class="h-2 flex-1 overflow-hidden rounded-full bg-black/[.06]">
                <span class="block h-full rounded-full" :style="{ width: `${88 - i * 13}%`, background: accent }" />
              </span>
            </div>
          </div>
        </div>

        <!-- ---------------- list ---------------- -->
        <div v-else-if="shot.kind === 'list'" class="h-full px-3 pt-7">
          <div class="mb-3 flex items-center justify-between">
            <span class="h-2.5 w-20 rounded-full bg-black/14" />
            <span class="h-4 w-4 rounded-full" :style="{ background: accent }" />
          </div>
          <div v-for="i in 6" :key="i" class="mb-2 flex items-center gap-2.5">
            <span class="h-7 w-7 shrink-0 rounded-[9px]" :style="{ background: `${accent}${i % 2 ? 'bb' : '66'}` }" />
            <span class="flex-1 space-y-1">
              <span class="block h-2 rounded-full bg-black/10" :style="{ width: `${64 + i * 4}%` }" />
              <span class="block h-1.5 w-1/3 rounded-full bg-black/[.06]" />
            </span>
          </div>
        </div>

        <!-- ---------------- camera ---------------- -->
        <div
          v-else-if="shot.kind === 'camera'"
          class="relative h-full"
          :style="{ background: `linear-gradient(170deg, ${accent}, #00000088)` }"
        >
          <div class="absolute inset-6 rounded-[14px] border-2 border-white/70" />
          <div class="absolute inset-x-4 top-16 h-16 rounded-[12px] bg-white/18" />
          <div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3">
            <span class="h-5 w-5 rounded-[6px] bg-white/60" />
            <span class="h-11 w-11 rounded-full border-[3px] border-white bg-white/25" />
            <span class="h-5 w-5 rounded-full bg-white/60" />
          </div>
        </div>

        <!-- ---------------- map ---------------- -->
        <div v-else-if="shot.kind === 'map'" class="relative h-full bg-[#e8eef2]">
          <svg viewBox="0 0 200 400" class="h-full w-full" aria-hidden="true">
            <g stroke="#cfd8de" stroke-width="8" fill="none">
              <path d="M-10 90h220M-10 210h220M-10 320h220M50 -10v420M140 -10v420" />
            </g>
            <path d="M0 150 200 120v40L0 200Z" fill="#dbe7d9" />
            <path d="M0 280 200 260v50L0 330Z" fill="#dbe7d9" />
            <circle cx="100" cy="196" r="10" :fill="accent" />
            <circle cx="100" cy="196" r="20" :fill="accent" opacity=".22" />
          </svg>
        </div>

        <!-- ---------------- music ---------------- -->
        <div v-else-if="shot.kind === 'music'" class="flex h-full flex-col px-4 pt-8">
          <div
            class="mx-auto h-[124px] w-[124px] rounded-[18px] shadow-apple-card"
            :style="{ background: `linear-gradient(150deg, ${accent}, #00000099)` }"
          />
          <div class="mt-5 space-y-2">
            <span class="block h-2.5 w-2/3 rounded-full bg-black/14" />
            <span class="block h-2 w-1/3 rounded-full bg-black/[.08]" />
          </div>
          <div class="mt-5 h-1.5 overflow-hidden rounded-full bg-black/[.08]">
            <span class="block h-full w-2/5 rounded-full" :style="{ background: accent }" />
          </div>
          <div class="mt-5 flex items-center justify-center gap-5">
            <span class="h-5 w-5 rounded-full bg-black/15" />
            <span class="h-10 w-10 rounded-full" :style="{ background: accent }" />
            <span class="h-5 w-5 rounded-full bg-black/15" />
          </div>
        </div>

        <!-- ---------------- cards ---------------- -->
        <div v-else-if="shot.kind === 'cards'" class="h-full px-3 pt-7">
          <div
            v-for="i in 3"
            :key="i"
            class="mb-2.5 rounded-[14px] p-3"
            :style="{ background: `${accent}${i === 1 ? '2e' : '18'}` }"
          >
            <span class="mb-2 block h-14 rounded-[9px]" :style="{ background: `${accent}44` }" />
            <span class="mb-1.5 block h-2 rounded-full bg-black/12" style="width: 70%" />
            <span class="block h-1.5 w-1/2 rounded-full bg-black/[.07]" />
          </div>
        </div>

        <!-- ---------------- board ---------------- -->
        <div v-else class="h-full pt-6">
          <div class="mb-2 flex items-center justify-between px-3">
            <span class="h-2 w-14 rounded-full bg-black/12" />
            <span class="h-2 w-8 rounded-full" :style="{ background: accent }" />
          </div>
          <div class="grid grid-cols-6 gap-[3px] px-2">
            <span
              v-for="i in 48"
              :key="i"
              class="aspect-square rounded-[5px]"
              :style="{
                background:
                  (i * 7) % 5 === 0
                    ? accent
                    : (i * 3) % 4 === 0
                      ? `${accent}66`
                      : 'rgba(0,0,0,.055)',
              }"
            />
          </div>
          <div class="mt-3 flex justify-center gap-2">
            <span class="h-8 w-8 rounded-[10px] bg-black/[.07]" />
            <span class="h-8 w-8 rounded-[10px]" :style="{ background: `${accent}bb` }" />
            <span class="h-8 w-8 rounded-[10px] bg-black/[.07]" />
          </div>
        </div>
      </div>
    </div>
    <figcaption class="mt-2.5 px-1 text-[11.5px] leading-snug text-muted">
      {{ shot.caption }}
    </figcaption>
  </figure>
</template>
