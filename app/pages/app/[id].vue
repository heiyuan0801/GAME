<script setup lang="ts">
import { byId, APPS, getAppVideos, type AppItem } from '~/data/apps'

const route = useRoute()
const id = computed(() => String(route.params.id))

const app = computed<AppItem | undefined>(() => byId(id.value))

if (!app.value) {
  throw createError({ statusCode: 404, statusMessage: 'App not found', fatal: true })
}

const a = app.value as AppItem
const videos = computed(() => getAppVideos(a))

useHead({
  title: `${a.name} on the App Store`,
  meta: [{ name: 'description', content: a.tagline }],
})

/* ---------------------------- interactions ---------------------------- */
const descOpen = ref(false)
const previewPlatform = ref('iPhone')
const reviewSort = ref('Most Helpful')
const showAllReviews = ref(false)
const copied = ref(false)
const lightboxIndex = ref<number | null>(null)

/* Preview tile geometry, kept in sync with MockScreen's aspect ratio. */
const SHOT_W = 208
const SHOT_H = Math.round(SHOT_W * 2.03)

const sortedReviews = computed(() => {
  const list = [...a.reviews]
  if (reviewSort.value === 'Most Recent') return list.reverse()
  if (reviewSort.value === 'Critical') return list.filter((r) => r.rating <= 3)
  return list.sort((x, y) => y.helpful - x.helpful)
})

const visibleReviews = computed(() =>
  showAllReviews.value ? sortedReviews.value : sortedReviews.value.slice(0, 2),
)

async function share() {
  const url = `${location.origin}/app/${a.id}`
  try {
    if (navigator.share) await navigator.share({ title: a.name, url })
    else {
      await navigator.clipboard.writeText(url)
      copied.value = true
      setTimeout(() => (copied.value = false), 1800)
    }
  } catch {
    /* user dismissed */
  }
}

const stats = computed(() => [
  { label: 'Ratings', value: `${a.rating.toFixed(1)}`, star: true, sub: a.ratingsCount },
  {
    label: 'Chart',
    value: a.chart.free ? `#${a.chart.free}` : a.chart.paid ? `#${a.chart.paid}` : a.chart.grossing ? `#${a.chart.grossing}` : '—',
    sub: a.category,
  },
  { label: 'Age', value: a.age, sub: 'Years Old' },
  { label: 'Developer', value: a.developer, sub: a.provider },
  { label: 'Language', value: a.languages.split(' ')[0]!, sub: a.languages },
  { label: 'Size', value: a.size.split(' ')[0]!, sub: a.size },
])

const infoRows = computed(() => [
  { label: 'Provider', value: a.provider },
  { label: 'Size', value: a.size },
  { label: 'Category', value: a.category },
  { label: 'Compatibility', value: 'Requires iOS 17.0 or later' },
  { label: 'Languages', value: a.languages },
  { label: 'Age Rating', value: a.age },
  { label: 'Price', value: a.price },
  { label: 'Developer Website', value: a.website, link: true },
  { label: 'Copyright', value: a.copyright },
])

/* Content-based recommendations, each carrying the reason it was surfaced. */
const related = computed(() => recommend(a, APPS, 6))
</script>

<template>
  <div class="mx-auto max-w-[1180px] px-4 pt-6 sm:px-6 sm:pt-8">
    <!-- ---------------------------- Lockup ---------------------------- -->
    <header class="flex flex-col gap-5 sm:flex-row sm:items-start">
      <AppIcon
        :name="a.icon"
        :size="112"
        class="mx-auto shrink-0 sm:mx-0 sm:!h-[128px] sm:!w-[128px]"
        radius="22.37%"
      />

      <div class="min-w-0 flex-1 text-center sm:text-left">
        <h1 class="text-[26px] leading-tight font-bold tracking-[-0.022em] sm:text-[32px]">
          {{ a.name }}
        </h1>
        <NuxtLink
          to="/charts"
          class="mt-0.5 inline-block text-[15px] font-medium text-link hover:underline"
        >
          {{ a.developer }}
        </NuxtLink>

        <p
          class="mt-2 text-[11px] font-semibold tracking-[0.06em] text-muted uppercase"
        >
          {{ a.category }}
        </p>
        <div class="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <span
            class="rounded-[5px] border border-hairline px-1.5 py-[1px] text-[10.5px] font-semibold text-muted"
          >
            {{ a.age }}
          </span>
          <span
            v-for="badge in a.editors ?? []"
            :key="badge"
            class="rounded-[5px] bg-blue/10 px-1.5 py-[1px] text-[10.5px] font-semibold text-link"
          >
            {{ badge }}
          </span>
        </div>

        <!-- CTA -->
        <div class="mt-5 flex items-center justify-center gap-3 sm:justify-start">
          <GetButton :app="a" size="lg" />
          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-full text-blue transition hover:bg-blue/8"
            :aria-label="copied ? 'Link copied' : 'Share app'"
            @click="share"
          >
            <UiIcon :name="copied ? 'check' : 'share'" :size="18" />
          </button>
          <span class="text-[12px] text-muted">{{ a.priceNote }}</span>
        </div>
      </div>
    </header>

    <!-- ---------------------------- Stats strip ---------------------------- -->
    <section
      class="no-scrollbar mt-6 flex overflow-x-auto border-y border-hairline"
      aria-label="App statistics"
    >
      <div
        v-for="(s, i) in stats"
        :key="s.label"
        class="flex min-w-[112px] flex-1 flex-col items-center justify-center px-4 py-3.5 text-center"
        :class="i > 0 ? 'border-l border-hairline' : ''"
      >
        <p class="text-[10.5px] font-semibold tracking-[0.06em] text-muted uppercase">
          {{ s.label }}
        </p>
        <p class="mt-1 flex items-center gap-1 text-[16px] font-semibold tracking-[-0.01em]">
          {{ s.value }}
          <UiIcon v-if="s.star" name="star" :size="13" fill class="text-amber" />
        </p>
        <p class="mt-0.5 max-w-full truncate text-[11px] text-muted">{{ s.sub }}</p>
      </div>
    </section>

    <!-- ---------------------------- What's New ---------------------------- -->
    <section class="mt-9">
      <div class="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 class="text-[21px] font-semibold tracking-[-0.016em]">What’s New</h2>
          <p class="mt-1 text-[12.5px] text-muted">
            {{ a.whatsNew.version }} · {{ a.whatsNew.date }}
          </p>
        </div>
        <button
          type="button"
          class="hidden shrink-0 text-[13px] font-medium text-link hover:underline sm:block"
        >
          Version History
        </button>
      </div>
      <ul class="max-w-[74ch] space-y-2">
        <li
          v-for="(b, i) in a.whatsNew.bullets"
          :key="i"
          class="flex gap-2.5 text-[14px] leading-[1.55] text-ink/85"
        >
          <span class="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" />
          <span>{{ b }}</span>
        </li>
      </ul>
    </section>

    <!-- ---------------------------- Video Preview ---------------------------- -->
    <VideoSection v-if="videos.length" :app="a" :videos="videos" />

    <!-- ---------------------------- Preview ---------------------------- -->
    <section class="mt-10">
      <div class="mb-3 flex items-center justify-between gap-4">
        <h2 class="text-[21px] font-semibold tracking-[-0.016em]">Preview</h2>
        <SegmentedControl
          v-model="previewPlatform"
          :options="['iPhone', 'iPad', 'Mac']"
          class="hidden sm:inline-flex"
        />
      </div>
      <div class="scroller -mx-4 flex gap-5 px-4 pb-2 sm:mx-0 sm:px-0">
        <button
          v-for="(s, i) in a.shots"
          :key="i"
          type="button"
          class="group/shot relative shrink-0 rounded-[30px] transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
          :aria-label="`View screenshot ${i + 1} of ${a.shots.length}: ${s.caption}`"
          @click="lightboxIndex = i"
        >
          <MockScreen :shot="s" :width="SHOT_W" />
          <span
            class="absolute top-[6px] left-[6px] right-[6px] grid place-items-center rounded-[24px] bg-black/0 opacity-0 transition duration-200 group-hover/shot:bg-black/25 group-hover/shot:opacity-100 group-focus-visible/shot:bg-black/25 group-focus-visible/shot:opacity-100"
            :style="{ height: `${SHOT_H - 12}px` }"
          >
            <span class="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-apple-float">
              <UiIcon name="expand" :size="18" />
            </span>
          </span>
        </button>
      </div>
    </section>

    <!-- ---------------------------- Main + sidebar ---------------------------- -->
    <div class="mt-11 grid gap-10 lg:grid-cols-[minmax(0,1fr)_318px] lg:gap-12">
      <!-- Main column -->
      <div class="min-w-0">
        <!-- Description -->
        <section>
          <h2 class="mb-3 text-[21px] font-semibold tracking-[-0.016em]">Description</h2>
          <p
            class="max-w-[74ch] text-[14px] leading-[1.6] text-ink/85"
            :class="descOpen ? '' : 'clamp-3'"
          >
            {{ a.description }}
          </p>
          <button
            type="button"
            class="mt-2 text-[13.5px] font-medium text-link hover:underline"
            @click="descOpen = !descOpen"
          >
            {{ descOpen ? 'Less' : 'more' }}
          </button>
        </section>

        <!-- Ratings & Reviews -->
        <section class="mt-11">
          <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
                Ratings &amp; Reviews
              </p>
              <h2 class="mt-1 text-[21px] font-semibold tracking-[-0.016em]">
                {{ a.rating.toFixed(1) }} out of 5 ·
                <span class="text-muted">{{ a.ratingsCount }} Ratings</span>
              </h2>
            </div>
            <button
              type="button"
              class="rounded-full bg-blue px-4 py-2 text-[13px] font-semibold text-on-blue transition hover:bg-blue-hover"
            >
              Write a Review
            </button>
          </div>

          <div class="rounded-[18px] bg-card p-5 shadow-apple-card sm:p-6">
            <RatingSummary :app="a" />
          </div>

          <!-- Sort -->
          <div class="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
            <button
              v-for="s in ['Most Helpful', 'Most Recent', 'Critical']"
              :key="s"
              type="button"
              class="shrink-0 rounded-full px-3.5 py-[6px] text-[12.5px] font-medium whitespace-nowrap transition"
              :class="
                reviewSort === s
                  ? 'bg-ink text-canvas'
                  : 'bg-fill text-ink/75 hover:bg-fill-strong'
              "
              @click="reviewSort = s"
            >
              {{ s }}
            </button>
          </div>

          <div class="mt-6 space-y-6">
            <ReviewCard v-for="r in visibleReviews" :key="r.id" :review="r" />
            <p v-if="!sortedReviews.length" class="py-8 text-center text-[13.5px] text-muted">
              No reviews in this filter yet.
            </p>
          </div>

          <button
            v-if="sortedReviews.length > 2"
            type="button"
            class="mt-5 text-[13.5px] font-medium text-link hover:underline"
            @click="showAllReviews = !showAllReviews"
          >
            {{ showAllReviews ? 'Show fewer reviews' : `See all ${sortedReviews.length} reviews` }}
          </button>
        </section>

        <!-- Related -->
        <section v-if="related.length" class="mt-11">
          <SectionHeading
            eyebrow="Recommended"
            title="You might also like"
            subtitle="Scored on category, developer, editorial focus and chart momentum"
            :more="{ label: 'See all', to: '/charts' }"
          />
          <div class="grid gap-3 sm:grid-cols-2">
            <NuxtLink
              v-for="r in related"
              :key="r.app.id"
              :to="`/app/${r.app.id}`"
              class="group flex items-center gap-3 rounded-[14px] border border-hairline bg-card p-3 transition hover:shadow-apple-card"
            >
              <AppIcon :name="r.app.icon" :size="52" />
              <span class="min-w-0 flex-1">
                <span class="block truncate text-[14px] font-medium">{{ r.app.name }}</span>
                <span class="block truncate text-[12px] text-muted">{{ r.app.tagline }}</span>
                <span class="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <StarRating :rating="r.app.rating" :size="10" />
                  <span class="text-[11px] text-muted">{{ r.app.ratingsCount }}</span>
                  <span
                    v-if="r.reasons[0]"
                    class="rounded-full bg-blue/10 px-2 py-[1px] text-[10.5px] font-medium text-link"
                  >
                    {{ r.reasons[0] }}
                  </span>
                </span>
              </span>
              <UiIcon name="chevronRight" :size="16" class="shrink-0 text-muted" />
            </NuxtLink>
          </div>
        </section>
      </div>

      <!-- Sidebar -->
      <aside class="space-y-6">
        <!-- App Privacy -->
        <section class="rounded-[18px] bg-card p-5 shadow-apple-card">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-[15.5px] font-semibold tracking-[-0.01em]">App Privacy</h3>
            <button type="button" class="text-[12.5px] font-medium text-link hover:underline">
              See Details
            </button>
          </div>
          <p class="text-[12.5px] leading-[1.5] text-muted">
            The developer, {{ a.provider }}, indicated that the app’s privacy practices may include
            handling of data as described below.
          </p>

          <dl class="mt-4 space-y-4">
            <div v-if="a.privacy.linked.length">
              <dt class="flex items-center gap-2 text-[13px] font-semibold">
                <UiIcon name="info" :size="14" class="text-ink/50" />
                Data Linked to You
              </dt>
              <dd class="mt-1.5 flex flex-wrap gap-1.5 pl-6">
                <span
                  v-for="d in a.privacy.linked"
                  :key="d"
                  class="rounded-full bg-fill px-2.5 py-[3px] text-[11.5px] text-ink/75"
                >
                  {{ d }}
                </span>
              </dd>
            </div>
            <div v-if="a.privacy.notLinked.length">
              <dt class="flex items-center gap-2 text-[13px] font-semibold">
                <UiIcon name="info" :size="14" class="text-ink/50" />
                Data Not Linked to You
              </dt>
              <dd class="mt-1.5 flex flex-wrap gap-1.5 pl-6">
                <span
                  v-for="d in a.privacy.notLinked"
                  :key="d"
                  class="rounded-full bg-fill px-2.5 py-[3px] text-[11.5px] text-ink/75"
                >
                  {{ d }}
                </span>
              </dd>
            </div>
            <div v-if="a.privacy.notTracked.length">
              <dt class="flex items-center gap-2 text-[13px] font-semibold">
                <UiIcon name="shield" :size="14" class="text-ink/50" />
                Data Not Used for Tracking
              </dt>
              <dd class="mt-1.5 flex flex-wrap gap-1.5 pl-6">
                <span
                  v-for="d in a.privacy.notTracked"
                  :key="d"
                  class="rounded-full bg-fill px-2.5 py-[3px] text-[11.5px] text-ink/75"
                >
                  {{ d }}
                </span>
              </dd>
            </div>
            <p v-if="!a.privacy.linked.length && !a.privacy.notLinked.length" class="text-[12.5px] text-muted">
              The developer does not collect any data from this app.
            </p>
          </dl>
        </section>

        <!-- Information -->
        <section class="rounded-[18px] bg-card p-5 shadow-apple-card">
          <h3 class="mb-2 text-[15.5px] font-semibold tracking-[-0.01em]">Information</h3>
          <InfoTable :rows="infoRows" />
        </section>

        <!-- Supports -->
        <section v-if="a.supports.length" class="rounded-[18px] bg-card p-5 shadow-apple-card">
          <h3 class="mb-3 text-[15.5px] font-semibold tracking-[-0.01em]">Supports</h3>
          <ul class="space-y-3">
            <li v-for="s in a.supports" :key="s.title" class="flex items-start gap-3">
              <span
                class="mt-[1px] grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-blue/10 text-blue"
              >
                <UiIcon name="bolt" :size="14" />
              </span>
              <span class="min-w-0">
                <span class="block text-[13px] font-medium">{{ s.title }}</span>
                <span class="block text-[11.5px] text-muted">{{ s.note }}</span>
              </span>
            </li>
          </ul>
        </section>
      </aside>
    </div>

    <ScreenshotLightbox
      :shots="a.shots"
      :app-name="a.name"
      :index="lightboxIndex"
      @update:index="lightboxIndex = $event"
      @close="lightboxIndex = null"
    />
  </div>
</template>
