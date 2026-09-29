<script setup lang="ts">
import { topFree, topPaid, topGrossing, byChart, type AppItem } from '~/data/apps'
import { CHART_CATEGORIES, CHART_INSIGHT } from '~/data/editorial'
import { PLATFORM_TABS } from '~/data/nav'
import type { TopChartsResponse } from '#shared/types/store'

useHead({ title: 'Top Charts — App Store' })

const route = useRoute()

const platform = ref('iPhone')
const category = ref('All Categories')

watch(
  () => route.query.platform,
  (v) => {
    if (typeof v !== 'string') return
    const hit = PLATFORM_TABS.find((p) => p.toLowerCase() === v.toLowerCase())
    if (hit) platform.value = hit
  },
  { immediate: true },
)

/* ------------------------------------------------------------------ *
 * Curated charts — the bundled snapshot, filterable by category.
 * ------------------------------------------------------------------ */

const columns = computed(() => {
  const filter = (list: AppItem[]) =>
    category.value === 'All Categories' ? list : list.filter((a) => a.category === category.value)

  return [
    { key: 'free', title: 'Top Free Apps', note: 'Free to download', rows: filter(topFree(10)) },
    { key: 'paid', title: 'Top Paid Apps', note: 'Paid up front', rows: filter(topPaid(10)) },
    {
      key: 'grossing',
      title: 'Top Grossing',
      note: 'Highest revenue',
      rows: filter(topGrossing(10)),
    },
  ]
})

const total = computed(
  () => byChart('free').length + byChart('paid').length + byChart('grossing').length,
)

/* ------------------------------------------------------------------ *
 * Live charts — Apple's real RSS rankings, enriched with the lookup API
 * by `/api/top-charts`. Fetched on demand so the bundled view still
 * renders instantly (and works offline).
 * ------------------------------------------------------------------ */

const SOURCE_TABS = ['Editor’s Charts', 'Live from Apple']
const GENRE_TABS = ['Apps', 'Games']

const REGIONS = [
  { code: 'us', label: 'United States' },
  { code: 'gb', label: 'United Kingdom' },
  { code: 'ca', label: 'Canada' },
  { code: 'jp', label: 'Japan' },
  { code: 'cn', label: 'China mainland' },
  { code: 'de', label: 'Germany' },
  { code: 'fr', label: 'France' },
  { code: 'in', label: 'India' },
  { code: 'br', label: 'Brazil' },
]

const source = ref(SOURCE_TABS[0]!)
const genre = ref(GENRE_TABS[0]!)
const country = ref('us')

const liveMode = computed(() => source.value === SOURCE_TABS[1])
const regionLabel = computed(
  () => REGIONS.find((r) => r.code === country.value)?.label ?? country.value.toUpperCase(),
)

const live = ref<TopChartsResponse | null>(null)
const liveState = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const liveMessage = ref('')

/** Region + genre identify a chart set; re-fetch only when it really changes. */
const liveKey = computed(() => `${country.value}:${genre.value}`)
let loadedKey = ''

async function loadLive() {
  liveState.value = 'loading'
  liveMessage.value = ''
  try {
    const res = await $fetch<TopChartsResponse>('/api/top-charts', {
      query: { country: country.value, kind: genre.value.toLowerCase(), limit: 10 },
    })
    live.value = res
    if (res.ok) {
      liveState.value = 'ready'
    } else {
      liveState.value = 'error'
      liveMessage.value = res.message ?? 'Live charts are unavailable right now.'
    }
  } catch (err) {
    liveState.value = 'error'
    // `$fetch` throws on non-2xx, but the service worker's offline reply still
    // carries a useful message — surface it instead of the generic fallback.
    const body = (err as { data?: TopChartsResponse } | undefined)?.data
    liveMessage.value =
      body?.message ?? 'Could not reach the chart service. Check your connection and try again.'
  }
}

watch([liveMode, liveKey], () => {
  if (!liveMode.value || liveKey.value === loadedKey) return
  loadedKey = liveKey.value
  loadLive()
})

const liveColumns = computed(() => {
  const c = live.value?.charts
  const noun = genre.value === 'Games' ? 'Games' : 'Apps'
  return [
    { key: 'free', title: `Top Free ${noun}`, note: 'Free to download', rows: c?.free ?? [] },
    { key: 'paid', title: `Top Paid ${noun}`, note: 'Paid up front', rows: c?.paid ?? [] },
    { key: 'grossing', title: 'Top Grossing', note: 'Highest revenue', rows: c?.grossing ?? [] },
  ]
})

const liveCount = computed(() => live.value?.charts.free.length ?? 0)
const showSkeleton = computed(() => liveMode.value && liveState.value === 'loading' && !live.value)
const showError = computed(() => liveMode.value && liveState.value === 'error' && !live.value)

/** Apple serves the same rankings from two hosts; say which one answered. */
const feedLabel = computed(() =>
  live.value?.source === 'marketingtools'
    ? 'the marketing feed'
    : live.value?.source === 'itunes-rss'
      ? 'the legacy RSS feed'
      : '',
)

/**
 * Formatted in UTC on purpose: `toLocaleString` would render differently on
 * the server and the client and blow up hydration.
 */
const updatedLabel = computed(() => {
  const raw = live.value?.updated
  if (!raw) return null
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  const stamp = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(d)
  return `${stamp} UTC`
})

/** Assembled in script so the separators don't depend on template whitespace. */
const liveStatus = computed(() => {
  const parts = [
    `Live rankings straight from Apple · ${regionLabel.value} · ${liveCount.value} titles per chart`,
  ]
  if (updatedLabel.value) parts.push(`feed updated ${updatedLabel.value}`)
  return parts.join(' · ')
})
</script>

<template>
  <div class="mx-auto max-w-[1180px] px-4 pt-6 sm:px-6 sm:pt-8">
    <!-- Insight banner -->
    <section class="banner-insight relative overflow-hidden rounded-[22px] p-6 shadow-apple-card sm:p-7">
      <svg
        viewBox="0 0 240 200"
        class="pointer-events-none absolute -right-4 -bottom-6 hidden h-[190px] w-[240px] text-blue/40 sm:block"
        aria-hidden="true"
      >
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round">
          <path d="M92 74h56v52H92z" />
          <path d="M104 60h32v14h-32zM124 126v18M100 144h48" />
          <path d="M78 100h14M148 100h14" />
        </g>
        <g fill="currentColor" opacity=".55">
          <rect x="102" y="88" width="16" height="26" rx="3" />
          <rect x="124" y="96" width="14" height="18" rx="3" />
        </g>
      </svg>

      <div class="relative max-w-[62ch]">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-blue/12 px-2.5 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-blue uppercase"
          >
            <UiIcon name="bolt" :size="12" fill />
            {{ CHART_INSIGHT.eyebrow }}
          </span>
          <span class="text-[11.5px] text-muted">· {{ CHART_INSIGHT.updated }}</span>
        </div>
        <!-- A promotional callout, not a section of the document, so it is not
             a heading — an <h2> here would precede the page's own <h1>. -->
        <p class="text-balance text-[24px] leading-[1.16] font-bold tracking-[-0.02em] sm:text-[30px]">
          {{ CHART_INSIGHT.title }}
        </p>
        <p class="mt-2.5 max-w-[58ch] text-[14px] leading-[1.5] text-muted">
          {{ CHART_INSIGHT.body }}
        </p>
        <button
          type="button"
          class="mt-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-card px-4 py-2 text-[13px] font-semibold text-ink shadow-apple-pill transition hover:bg-fill-subtle"
          @click="source = SOURCE_TABS[1]"
        >
          <UiIcon name="trending" :size="15" class="text-blue" />
          {{ CHART_INSIGHT.cta }}
        </button>
      </div>
    </section>

    <!-- Heading + platform switch -->
    <section class="mt-9">
      <p class="text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
        Rankings &amp; Velocity
      </p>
      <div class="mt-1.5 flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-[30px] leading-none font-bold tracking-[-0.022em] sm:text-[38px]">
          Top Charts
        </h1>
        <SegmentedControl v-model="platform" :options="PLATFORM_TABS" />
      </div>
      <p class="mt-2 text-[13px] text-muted">
        <template v-if="liveMode">
          <template v-if="liveState === 'ready'">{{ liveStatus }}</template>
          <template v-else-if="liveState === 'loading'">
            Fetching the latest rankings from Apple…
          </template>
          <template v-else> Live rankings straight from Apple · {{ regionLabel }} </template>
        </template>
        <template v-else>
          {{ total }} ranked titles across free, paid and grossing charts · showing
          <span class="font-medium text-ink">{{ platform }}</span>
        </template>
      </p>
    </section>

    <!-- Data source -->
    <section class="mt-5 flex flex-wrap items-center gap-2.5">
      <SegmentedControl v-model="source" :options="SOURCE_TABS" />

      <template v-if="liveMode">
        <SegmentedControl v-model="genre" :options="GENRE_TABS" />

        <label class="relative inline-flex items-center">
          <span class="sr-only">Storefront region</span>
          <select
            v-model="country"
            class="appearance-none rounded-[9px] border border-hairline bg-card py-[7px] pr-8 pl-3 text-[13px] font-medium text-ink shadow-apple-pill transition hover:bg-fill-subtle focus:ring-2 focus:ring-blue/40 focus:outline-none"
          >
            <option v-for="r in REGIONS" :key="r.code" :value="r.code">{{ r.label }}</option>
          </select>
          <UiIcon
            name="chevronDown"
            :size="13"
            class="pointer-events-none absolute right-2.5 text-muted"
          />
        </label>

        <button
          type="button"
          :disabled="liveState === 'loading'"
          class="ml-auto inline-flex items-center gap-1.5 rounded-full border border-hairline bg-card px-3.5 py-[7px] text-[12.5px] font-semibold text-ink shadow-apple-pill transition hover:bg-fill-subtle disabled:opacity-50"
          @click="loadLive()"
        >
          <UiIcon name="clock" :size="13" class="text-blue" />
          {{ liveState === 'loading' ? 'Updating…' : 'Refresh' }}
        </button>
      </template>
    </section>

    <!-- Category filter (curated charts only) -->
    <section v-if="!liveMode" class="mt-4">
      <ChipRow v-model="category" :options="CHART_CATEGORIES" />
    </section>

    <!-- Curated chart columns -->
    <section v-if="!liveMode" class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ChartColumn
        v-for="col in columns"
        :key="col.key"
        :title="col.title"
        :note="col.note"
      >
        <div v-if="col.rows.length" class="space-y-0.5">
          <ChartRow v-for="(a, i) in col.rows" :key="a.id" :app="a" :rank="i + 1" />
        </div>
        <p v-else class="px-2 py-10 text-center text-[13px] text-muted">
          No {{ category.toLowerCase() }} titles in this chart yet.
        </p>
      </ChartColumn>
    </section>

    <!-- Live chart columns -->
    <section
      v-else
      class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3"
      :aria-busy="showSkeleton"
    >
      <div
        v-if="showError"
        class="rounded-[22px] bg-card px-6 py-12 text-center shadow-apple-card lg:col-span-3"
      >
        <UiIcon name="info" :size="30" class="mx-auto text-muted" />
        <p class="mt-3 text-[16px] font-semibold tracking-[-0.012em]">
          Live charts are unavailable
        </p>
        <p class="mx-auto mt-1.5 max-w-[46ch] text-[13px] leading-[1.5] text-muted">
          {{ liveMessage }}
        </p>
        <button
          type="button"
          class="mt-5 inline-flex items-center gap-2 rounded-full bg-blue px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-blue-hover"
          @click="loadLive()"
        >
          <UiIcon name="clock" :size="14" />
          Try again
        </button>
      </div>

      <template v-else>
        <ChartColumn
          v-for="col in liveColumns"
          :key="col.key"
          :title="col.title"
          :note="col.note"
          :loading="showSkeleton"
          class="transition-opacity"
          :class="liveState === 'loading' && live ? 'opacity-60' : ''"
        >
          <div v-if="col.rows.length" class="space-y-0.5">
            <LiveChartRow v-for="e in col.rows" :key="e.id" :entry="e" />
          </div>
          <p v-else class="px-2 py-10 text-center text-[13px] text-muted">
            Nothing in this chart for {{ regionLabel }} right now.
          </p>
        </ChartColumn>
      </template>
    </section>

    <!-- Provenance note -->
    <p v-if="liveMode" class="mt-5 flex items-start gap-1.5 text-[11.5px] leading-[1.5] text-muted">
      <UiIcon name="globe" :size="13" class="mt-px" />
      <span>
        Rankings come from Apple’s public chart feeds<span v-if="feedLabel">
          ({{ feedLabel }})</span
        >
        and are refreshed roughly every hour. Each row opens the real listing on apps.apple.com.
      </span>
    </p>
  </div>
</template>
