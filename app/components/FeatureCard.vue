<script setup lang="ts">
import type { FeatureCard } from '~/data/editorial'
import { byId } from '~/data/apps'

const props = defineProps<{ card: FeatureCard }>()
const app = computed(() => byId(props.card.appId))
</script>

<template>
  <NuxtLink
    :to="`/app/${card.appId}`"
    class="group relative flex h-[240px] flex-col overflow-hidden rounded-[22px] p-6 shadow-apple-card transition-transform duration-300 hover:-translate-y-0.5"
    :style="{ background: card.gradient }"
  >
    <span
      class="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-25 blur-2xl"
      :style="{ background: app?.accent }"
    />

    <div class="relative flex flex-1 flex-col">
      <p class="text-[11px] font-semibold tracking-[0.08em] text-white/60 uppercase">
        {{ card.eyebrow }}
      </p>
      <h3
        class="mt-3 max-w-[18ch] text-balance text-[23px] leading-[1.14] font-bold tracking-[-0.02em] text-white sm:text-[26px]"
      >
        {{ card.title }}
      </h3>
      <div class="flex-1" />

      <div class="flex items-center gap-3">
        <AppIcon v-if="app" :name="app.icon" :size="38" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-[13px] font-semibold text-white">{{ app?.name }}</p>
          <p class="truncate text-[11.5px] text-white/60">{{ card.appNote }}</p>
        </div>
        <span
          class="shrink-0 rounded-full bg-white/22 px-3.5 py-[5px] text-[12.5px] font-semibold text-white backdrop-blur transition group-hover:bg-white/40"
        >
          View
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
