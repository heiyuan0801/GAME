<script setup lang="ts">
import { APPS, type AppItem } from '~/data/apps'
import { CATEGORY_GROUPS } from '~/data/editorial'

const route = useRoute()
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const meta = computed(() => CATEGORY_GROUPS.find((c) => slugify(c.name) === route.params.slug))
const name = computed(() => meta.value?.name ?? 'Category')
const apps = computed<AppItem[]>(() => APPS.filter((a) => a.category === name.value))

if (!meta.value) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found', fatal: true })
}

useHead({ title: `${name.value} — App Store` })

const ranked = computed(() => [...apps.value].sort((a, b) => b.rating - a.rating))
</script>

<template>
  <div class="mx-auto max-w-[1180px] px-4 pt-6 pb-4 sm:px-6 sm:pt-8">
    <nav class="mb-4 flex items-center gap-1.5 text-[12.5px] text-muted">
      <NuxtLink to="/categories" class="transition hover:text-ink">Categories</NuxtLink>
      <UiIcon name="chevronRight" :size="13" />
      <span class="text-ink">{{ name }}</span>
    </nav>

    <header
      class="relative mb-8 overflow-hidden rounded-[22px] border border-hairline p-6 sm:p-8"
      :style="{ background: meta!.tint }"
    >
      <span class="text-[34px] leading-none">{{ meta!.glyph }}</span>
      <h1
        class="mt-3 text-[30px] leading-none font-bold tracking-[-0.022em] on-light sm:text-[38px]"
      >
        {{ name }}
      </h1>
      <p class="mt-2 text-[13.5px] on-light-muted">
        {{ apps.length }} {{ apps.length === 1 ? 'title' : 'titles' }} on the storefront
      </p>
      <span
        class="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full opacity-25"
        :style="{ background: meta!.accent }"
      />
    </header>

    <div v-if="apps.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <AppGridCard v-for="a in apps" :key="a.id" :app="a" />
    </div>

    <p v-else class="rounded-[18px] border border-hairline bg-card py-16 text-center text-[14px] text-muted">
      No titles in this category yet. Check back soon.
    </p>

    <!-- Highest rated -->
    <section v-if="ranked.length > 3" class="mt-11">
      <SectionHeading eyebrow="Ranked" :title="`Highest rated in ${name}`" />
      <div class="grid gap-3 sm:grid-cols-2">
        <AppRow v-for="(a, i) in ranked.slice(0, 6)" :key="a.id" :app="a" :rank="i + 1" />
      </div>
    </section>
  </div>
</template>
