<script setup lang="ts">
import { SEARCH_SUGGESTIONS } from '~/data/editorial'
import { byId } from '~/data/apps'

const router = useRouter()
const route = useRoute()
const { theme, toggle } = useTheme()
const { user, openAuth } = useAuth()

const initials = computed(() =>
  (user.value?.name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join(''),
)

/**
 * The theme is resolved by the pre-paint script and the client plugin, so by the
 * time the app hydrates the client already knows something the server could not.
 * Both glyphs are therefore always rendered and the `.dark` class on
 * `<html>` decides which one is visible; only the labels wait for mount.
 */
const hydrated = ref(false)
onMounted(() => {
  hydrated.value = true
})
const isDark = computed(() => hydrated.value && theme.value === 'dark')

const q = ref(typeof route.query.q === 'string' ? route.query.q : '')
const focused = ref(false)
const wrap = ref<HTMLElement | null>(null)

watch(
  () => route.query.q,
  (v) => {
    if (typeof v === 'string') q.value = v
  },
)

const results = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return []
  return SEARCH_SUGGESTIONS.map((id) => byId(id))
    .filter((a): a is NonNullable<typeof a> => !!a)
    .filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        a.developer.toLowerCase().includes(term) ||
        a.category.toLowerCase().includes(term),
    )
    .slice(0, 5)
})

function submit() {
  const term = q.value.trim()
  focused.value = false
  router.push(term ? `/search?q=${encodeURIComponent(term)}` : '/search')
}

function onDocClick(e: MouseEvent) {
  if (wrap.value && !wrap.value.contains(e.target as Node)) focused.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-hairline/70 bg-chrome frosted">
    <div class="mx-auto flex h-[58px] max-w-[1180px] items-center gap-2 px-4 sm:gap-3 sm:px-6">
      <!-- Mobile brand: the mark is the only content, so it needs a name. -->
      <NuxtLink to="/" class="flex items-center gap-2 lg:hidden" aria-label="App Store home">
        <span
          class="grid h-7 w-7 place-items-center rounded-[8px] text-white"
          style="background: linear-gradient(160deg, #1f9bf7 0%, #0a6ae0 100%)"
          aria-hidden="true"
        >
          <UiIcon name="appstore" :size="17" />
        </span>
      </NuxtLink>

      <!-- Search -->
      <div ref="wrap" class="relative mx-auto w-full max-w-[520px]">
        <form role="search" @submit.prevent="submit">
          <label class="relative block">
            <UiIcon
              name="search"
              :size="16"
              class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
            />
            <input
              v-model="q"
              type="search"
              aria-label="Search apps, games, stories and more"
              placeholder="Search apps, games, stories and more"
              class="h-[38px] w-full rounded-[10px] border border-transparent bg-fill pr-3 pl-9 text-[14px] text-ink transition outline-none placeholder:text-muted focus:border-blue/40 focus:bg-card focus:ring-4 focus:ring-blue/12"
              @focus="focused = true"
            />
            <button
              v-if="q"
              type="button"
              class="absolute top-1/2 right-2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-fill-strong"
              aria-label="Clear search"
              @click="((q = ''), submit())"
            >
              <UiIcon name="close" :size="14" />
            </button>
          </label>
        </form>

        <!-- Live suggestions -->
        <div
          v-if="focused && results.length"
          class="absolute inset-x-0 top-[46px] overflow-hidden rounded-[12px] border border-hairline bg-card py-1 shadow-apple-float"
        >
          <button
            v-for="r in results"
            :key="r.id"
            type="button"
            class="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-fill"
            @click="((q = r.name), submit())"
          >
            <AppIcon :name="r.icon" :size="28" />
            <span class="min-w-0">
              <span class="block truncate text-[13.5px] font-medium">{{ r.name }}</span>
              <span class="block truncate text-[11.5px] text-muted">{{ r.category }}</span>
            </span>
          </button>
        </div>
      </div>

      <!-- Right -->
      <div class="flex shrink-0 items-center gap-0.5">
        <NuxtLink
          to="/search"
          class="grid h-8 w-8 place-items-center rounded-full text-ink/70 transition hover:bg-fill lg:hidden"
          aria-label="Search"
        >
          <UiIcon name="search" :size="18" />
        </NuxtLink>

        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-full text-ink/70 transition hover:bg-fill"
          aria-haspopup="dialog"
          :aria-label="user ? `Account: ${user.name}` : 'Sign in'"
          @click="openAuth(user ? 'account' : 'signin')"
        >
          <span
            v-if="user"
            class="grid h-7 w-7 place-items-center rounded-full text-[11px] font-semibold text-white"
            style="background: linear-gradient(160deg, #1f9bf7 0%, #0a6ae0 100%)"
            aria-hidden="true"
          >
            {{ initials }}
          </span>
          <UiIcon v-else name="person" :size="18" />
        </button>

        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-full text-ink/70 transition hover:bg-fill"
          :aria-label="isDark ? 'Switch to light appearance' : 'Switch to dark appearance'"
          :title="isDark ? 'Light appearance' : 'Dark appearance'"
          @click="toggle"
        >
          <UiIcon name="moon" :size="18" class="theme-glyph-light" />
          <UiIcon name="sun" :size="18" class="theme-glyph-dark" />
        </button>

        <span class="ml-1 hidden text-ink lg:block" aria-hidden="true">
          <UiIcon name="apple" :size="19" fill />
        </span>
      </div>
    </div>
  </header>
</template>
