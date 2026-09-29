<script setup lang="ts">
import { byId, type AppItem } from '~/data/apps'
import { ARCADE_FEATURED, type HeroCard } from '~/data/editorial'

useHead({ title: 'Apple Arcade — App Store' })

const games = ARCADE_FEATURED.map(byId).filter((a): a is AppItem => !!a)
const spotlight = games[0]!
const second = games[1]!

const spotlightCards: HeroCard[] = [
  {
    id: 'arcade-1',
    eyebrow: 'Apple Arcade',
    title: spotlight.tagline,
    appId: spotlight.id,
    note: spotlight.developer,
    cta: 'View',
    gradient: 'linear-gradient(135deg,#2f6b46 0%,#1d4a2f 45%,#0f2c1c 100%)',
    glow: 'radial-gradient(120% 100% at 15% 110%, rgba(122,214,150,.35), transparent 60%)',
    motif: 'sasquatch',
  },
  {
    id: 'arcade-2',
    eyebrow: 'Play Now',
    title: second.tagline,
    appId: second.id,
    note: second.developer,
    cta: 'View',
    gradient: 'linear-gradient(135deg,#3a2f7a 0%,#241a52 50%,#120c2e 100%)',
    glow: 'radial-gradient(120% 100% at 85% 110%, rgba(160,130,255,.35), transparent 60%)',
    motif: 'wind',
  },
]

const perks = [
  { icon: 'bolt', title: 'No ads. No in-app purchases.', note: 'Every game is the full experience.' },
  { icon: 'gift', title: 'New games every month.', note: 'Plus timely updates and exclusives.' },
  { icon: 'shield', title: 'Play across your devices.', note: 'iPhone, iPad, Mac and Apple TV.' },
]
</script>

<template>
  <div class="mx-auto max-w-[1180px] px-4 pt-6 pb-4 sm:px-6 sm:pt-8">
    <!-- Hero -->
    <section
      class="relative overflow-hidden rounded-[26px] p-7 shadow-apple-card sm:p-10"
      style="background: linear-gradient(140deg, #1c2b4a 0%, #101a2e 55%, #070b14 100%)"
    >
      <span
        class="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style="background: #4aa8ff"
      />
      <svg viewBox="0 0 400 260" class="pointer-events-none absolute inset-y-0 right-0 h-full w-[46%] opacity-40" aria-hidden="true">
        <g fill="none" stroke="#7fb2ff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M210 40h60v34h-60zM232 22h16v18h-16zM240 74v22M216 118h48" />
          <path d="M172 92h26M288 92h26M150 150h32M264 150h32" />
        </g>
        <g fill="#7fb2ff" opacity=".5">
          <rect x="222" y="52" width="14" height="14" rx="3" />
          <rect x="244" y="52" width="14" height="14" rx="3" />
          <rect x="196" y="132" width="88" height="12" rx="6" />
        </g>
      </svg>

      <div class="relative max-w-[54ch]">
        <p class="flex items-center gap-2 text-[12px] font-semibold tracking-[0.1em] text-white/60 uppercase">
          <UiIcon name="arcade" :size="16" class="text-white/70" />
          Apple Arcade
        </p>
        <h1
          class="mt-3 text-balance text-[30px] leading-[1.1] font-bold tracking-[-0.024em] text-white sm:text-[42px]"
        >
          Play what you want.<br />No limits.
        </h1>
        <p class="mt-3 max-w-[46ch] text-[14.5px] leading-[1.55] text-white/70">
          Hundreds of games, all with no ads and no in-app purchases. One subscription, the whole
          family, every device.
        </p>
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-ink transition hover:bg-white/85"
          >
            Try It Free
          </button>
          <span class="text-[12.5px] text-white/55">1 month free, then $6.99/month.</span>
        </div>
      </div>
    </section>

    <!-- Perks -->
    <section class="mt-6 grid gap-3 sm:grid-cols-3">
      <div
        v-for="p in perks"
        :key="p.title"
        class="flex gap-3 rounded-[16px] border border-hairline bg-card p-4"
      >
        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-blue/10 text-blue">
          <UiIcon :name="p.icon" :size="15" />
        </span>
        <span class="min-w-0">
          <span class="block text-[13.5px] font-semibold">{{ p.title }}</span>
          <span class="mt-0.5 block text-[12px] text-muted">{{ p.note }}</span>
        </span>
      </div>
    </section>

    <!-- Spotlight -->
    <section class="mt-11">
      <SectionHeading eyebrow="Featured" title="Start playing today" />
      <div class="grid gap-4 lg:grid-cols-2">
        <HeroCard v-for="c in spotlightCards" :key="c.id" :card="c" />
      </div>
    </section>

    <!-- All arcade titles -->
    <section class="mt-11">
      <SectionHeading title="All Apple Arcade games" :more="{ label: 'See charts', to: '/charts' }" />
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <AppGridCard v-for="g in games" :key="g.id" :app="g" />
      </div>
    </section>
  </div>
</template>
