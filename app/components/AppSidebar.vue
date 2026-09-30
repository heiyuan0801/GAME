<script setup lang="ts">
import { DISCOVER_NAV, PLATFORM_NAV, DEVICES } from '~/data/nav'
import { CATEGORY_GROUPS } from '~/data/editorial'

const route = useRoute()
const device = ref(DEVICES[0]!)
const deviceOpen = ref(false)

const { user, openAuth } = useAuth()

const initials = computed(() =>
  (user.value?.name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join(''),
)

const isActive = (to: string) => {
  const base = to.split('?')[0]!
  if (base === '/') return route.path === '/'
  return route.path === base || route.path.startsWith(base + '/')
}
</script>

<template>
  <aside
    class="hidden w-[260px] shrink-0 lg:block"
    aria-label="Store navigation"
  >
    <div class="sticky top-0 flex h-dvh flex-col">
      <!-- Brand -->
      <NuxtLink
        to="/"
        class="flex items-center gap-2.5 px-5 pt-5 pb-4 transition-opacity hover:opacity-70"
      >
        <span
          class="grid h-7 w-7 place-items-center rounded-[8px] text-white"
          style="background: linear-gradient(160deg, #1f9bf7 0%, #0a6ae0 100%)"
        >
          <UiIcon name="appstore" :size="17" />
        </span>
        <span class="text-[17px] font-semibold tracking-[-0.02em]">App Store</span>
      </NuxtLink>

      <!-- Scrollable groups -->
      <nav class="no-scrollbar flex-1 overflow-y-auto px-3 pb-4">
        <ul class="space-y-0.5">
          <li v-for="item in DISCOVER_NAV" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="group flex items-center gap-3 rounded-[10px] px-3 py-[9px] text-[14px] transition"
              :class="
                isActive(item.to)
                  ? 'bg-fill font-semibold text-ink'
                  : 'font-medium text-ink/80 hover:bg-fill-subtle'
              "
            >
              <UiIcon
                :name="item.glyph"
                :size="18"
                :class="isActive(item.to) ? 'text-blue' : 'text-ink/55'"
              />
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>

        <p
          class="px-3 pt-5 pb-1.5 text-[11px] font-semibold tracking-[0.06em] text-muted uppercase"
        >
          Categories
        </p>
        <ul class="space-y-0.5">
          <li v-for="c in CATEGORY_GROUPS.slice(0, 8)" :key="c.name">
            <NuxtLink
              :to="`/categories/${encodeURIComponent(c.name.toLowerCase().replace(/[^a-z]+/g, '-'))}`"
              class="flex items-center gap-3 rounded-[10px] px-3 py-[7px] text-[13.5px] font-medium text-ink/75 transition hover:bg-fill-subtle"
            >
              <span
                class="h-[7px] w-[7px] shrink-0 rounded-full"
                :style="{ background: c.accent }"
              />
              {{ c.name }}
            </NuxtLink>
          </li>
        </ul>

        <p
          class="px-3 pt-5 pb-1.5 text-[11px] font-semibold tracking-[0.06em] text-muted uppercase"
        >
          Platforms
        </p>
        <ul class="space-y-0.5">
          <li v-for="item in PLATFORM_NAV" :key="item.label">
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-3 rounded-[10px] px-3 py-[7px] text-[13.5px] font-medium text-ink/75 transition hover:bg-fill-subtle"
            >
              <UiIcon :name="item.glyph" :size="17" class="text-ink/50" />
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Account -->
      <div class="border-t border-hairline/70 px-4 py-3">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-[10px] px-2 py-2 text-left transition hover:bg-fill-subtle"
          aria-haspopup="dialog"
          :aria-label="user ? `Signed in as ${user.name}` : 'Sign in to your account'"
          @click="openAuth(user ? 'account' : 'signin')"
        >
          <span
            v-if="user"
            class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-semibold text-white"
            style="background: linear-gradient(160deg, #1f9bf7 0%, #0a6ae0 100%)"
            aria-hidden="true"
          >
            {{ initials }}
          </span>
          <UiIcon v-else name="person" :size="18" class="shrink-0 text-ink/55" />

          <span class="min-w-0 flex-1">
            <span class="block truncate text-[13.5px] font-medium text-ink">
              {{ user ? user.name : 'Sign in' }}
            </span>
            <span class="block truncate text-[11.5px] text-muted">
              {{ user ? user.email : 'Sync purchases and reviews' }}
            </span>
          </span>

          <UiIcon name="chevronRight" :size="15" class="shrink-0 text-muted" />
        </button>
      </div>

      <!-- Device picker -->
      <div class="relative border-t border-hairline/70 px-4 py-3">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-[10px] bg-fill-subtle px-3 py-2 text-left text-[12.5px] transition hover:bg-fill"
          :aria-expanded="deviceOpen"
          @click="deviceOpen = !deviceOpen"
        >
          <span class="truncate">
            <span class="text-muted">Device: </span>
            <span class="font-medium text-ink">{{ device }}</span>
          </span>
          <UiIcon name="chevronDown" :size="15" class="text-muted" />
        </button>
        <ul
          v-if="deviceOpen"
          class="absolute right-4 bottom-[calc(100%-4px)] left-4 z-30 max-h-64 overflow-y-auto rounded-[12px] border border-hairline bg-card py-1 shadow-apple-float"
        >
          <li v-for="d in DEVICES" :key="d">
            <button
              type="button"
              class="flex w-full items-center justify-between px-3 py-1.5 text-left text-[12.5px] hover:bg-fill-subtle"
              @click="((device = d), (deviceOpen = false))"
            >
              {{ d }}
              <UiIcon v-if="d === device" name="check" :size="14" class="text-blue" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>
