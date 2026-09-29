<script setup lang="ts">
import { APPS, byId, type AppItem } from '~/data/apps'
import { TRENDING_SEARCHES, SEARCH_SUGGESTIONS, CATEGORY_GROUPS } from '~/data/editorial'

const route = useRoute()
const router = useRouter()

const q = ref(typeof route.query.q === 'string' ? route.query.q : '')
const input = ref<HTMLInputElement | null>(null)

watch(
  () => route.query.q,
  (v) => {
    q.value = typeof v === 'string' ? v : ''
  },
)

const term = computed(() => q.value.trim().toLowerCase())

const results = computed<AppItem[]>(() => {
  if (!term.value) return []
  return APPS.filter(
    (a) =>
      a.name.toLowerCase().includes(term.value) ||
      a.developer.toLowerCase().includes(term.value) ||
      a.category.toLowerCase().includes(term.value) ||
      a.tagline.toLowerCase().includes(term.value),
  ).sort((a, b) => b.rating - a.rating)
})

const suggestions = computed<AppItem[]>(() =>
  SEARCH_SUGGESTIONS.map(byId).filter((a): a is AppItem => !!a),
)

/* ------------------------------------------------------------------
   Live results — proxied through /api/store-search so the upstream
   iTunes Search API call stays same-origin and fails gracefully.
   ------------------------------------------------------------------ */
const live = ref<StoreResult[]>([])
const liveState = ref<'idle' | 'loading' | 'error' | 'empty'>('idle')
const liveMessage = ref('')
let debounce: ReturnType<typeof setTimeout> | null = null

async function fetchLive(t: string) {
  if (t.length < 2) {
    live.value = []
    liveState.value = 'idle'
    return
  }
  liveState.value = 'loading'
  try {
    const res = await $fetch<StoreSearchResponse>('/api/store-search', {
      params: { term: t, limit: 12 },
    })
    live.value = res.results ?? []
    liveMessage.value = res.message ?? ''
    liveState.value = res.ok ? (res.results.length ? 'idle' : 'empty') : 'error'
  } catch {
    live.value = []
    liveMessage.value = ''
    liveState.value = 'error'
  }
}

// Debounced while typing…
watch(term, (t) => {
  if (debounce) clearTimeout(debounce)
  if (!import.meta.client) return
  if (t.length < 2) {
    live.value = []
    liveState.value = 'idle'
    return
  }
  liveState.value = 'loading'
  debounce = setTimeout(() => fetchLive(t), 400)
})

// …but immediate when landing on /search?q=… directly.
onMounted(() => {
  if (term.value.length >= 2) fetchLive(term.value)
})

onBeforeUnmount(() => {
  if (debounce) clearTimeout(debounce)
})

function run(value?: string) {
  if (typeof value === 'string') q.value = value
  const t = q.value.trim()
  router.replace(t ? { query: { q: t } } : { query: {} })
}

onMounted(() => input.value?.focus())

useHead({
  title: () => (term.value ? `${q.value} — Search — App Store` : 'Search — App Store'),
})
</script>

<template>
  <div class="mx-auto max-w-[1180px] px-4 pt-6 pb-4 sm:px-6 sm:pt-8">
    <!-- The field is the page title visually, so the heading is exposed to
         assistive tech only. -->
    <h1 class="sr-only">Search the App Store</h1>

    <!-- Search field -->
    <form class="relative mb-7" role="search" @submit.prevent="run()">
      <UiIcon
        name="search"
        :size="18"
        class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
      />
      <input
        ref="input"
        v-model="q"
        type="search"
        aria-label="Search games, apps, stories and more"
        placeholder="Games, apps, stories and more"
        class="h-[52px] w-full rounded-[14px] border border-transparent bg-fill pr-4 pl-12 text-[16px] outline-none transition placeholder:text-muted focus:border-blue/40 focus:bg-card focus:ring-4 focus:ring-blue/12"
        @input="run()"
      />
      <button
        v-if="q"
        type="button"
        class="absolute top-1/2 right-3 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-fill"
        aria-label="Clear"
        @click="((q = ''), run())"
      >
        <UiIcon name="close" :size="15" />
      </button>
    </form>

    <!-- Results -->
    <template v-if="term">
      <p class="mb-4 text-[13px] text-muted">
        {{ results.length }} {{ results.length === 1 ? 'result' : 'results' }} for
        <span class="font-medium text-ink">“{{ q }}”</span>
      </p>

      <div v-if="results.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <AppGridCard v-for="a in results" :key="a.id" :app="a" />
      </div>

      <div v-else class="rounded-[18px] border border-hairline bg-card py-16 text-center">
        <p class="text-[15px] font-medium">No results found</p>
        <p class="mx-auto mt-1.5 max-w-[36ch] text-[13px] text-muted">
          Check the spelling, or try one of the suggestions below.
        </p>
      </div>

      <!-- Live results from Apple's public search API -->
      <section class="mt-11">
        <SectionHeading
          eyebrow="Live"
          title="From the App Store"
          subtitle="Real results, fetched from Apple’s public search API"
        />

        <div
          v-if="liveState === 'loading'"
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          aria-hidden="true"
        >
          <div
            v-for="i in 5"
            :key="i"
            class="animate-pulse rounded-[18px] border border-hairline bg-card p-4"
          >
            <div class="h-[62px] w-[62px] rounded-[14px] bg-fill" />
            <div class="mt-3 h-3 w-3/4 rounded-full bg-fill" />
            <div class="mt-2 h-2.5 w-1/2 rounded-full bg-fill" />
            <div class="mt-6 h-6 w-16 rounded-full bg-fill" />
          </div>
        </div>

        <div
          v-else-if="live.length"
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        >
          <StoreResultCard v-for="r in live" :key="r.id" :result="r" />
        </div>

        <p
          v-else-if="liveState === 'error'"
          class="rounded-[18px] border border-hairline bg-card px-4 py-8 text-center text-[13.5px] text-muted"
        >
          {{ liveMessage || 'Live App Store results are unavailable right now.' }}
        </p>

        <p
          v-else-if="liveState === 'empty'"
          class="rounded-[18px] border border-hairline bg-card px-4 py-8 text-center text-[13.5px] text-muted"
        >
          Nothing matching “{{ q }}” in the live storefront.
        </p>
      </section>
    </template>

    <!-- Empty state -->
    <template v-else>
      <section class="mb-9">
        <SectionHeading eyebrow="Trending" title="What people are searching for" />
        <div class="flex flex-wrap gap-2">
          <button
            v-for="t in TRENDING_SEARCHES"
            :key="t"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full bg-fill px-3.5 py-[7px] text-[13px] font-medium text-ink/80 transition hover:bg-fill-strong"
            @click="((q = t), run())"
          >
            <UiIcon name="trending" :size="13" class="text-blue" />
            {{ t }}
          </button>
        </div>
      </section>

      <section class="mb-9">
        <SectionHeading title="Suggested apps" />
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <AppGridCard v-for="a in suggestions" :key="a.id" :app="a" />
        </div>
      </section>

      <section>
        <SectionHeading title="Browse categories" :more="{ label: 'All', to: '/categories' }" />
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="c in CATEGORY_GROUPS"
            :key="c.name"
            :to="`/categories/${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`"
            class="rounded-full border border-hairline bg-card px-3.5 py-[7px] text-[13px] font-medium transition hover:border-ink/20 hover:shadow-apple-pill"
          >
            {{ c.glyph }} {{ c.name }}
          </NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>
