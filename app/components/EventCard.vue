<script setup lang="ts">
import type { EventCard } from '~/data/editorial'
import { byId } from '~/data/apps'

const props = defineProps<{ card: EventCard }>()
const app = computed(() => byId(props.card.appId))
</script>

<template>
  <NuxtLink
    :to="`/app/${card.appId}`"
    class="group flex flex-col overflow-hidden rounded-[20px] bg-card p-5 shadow-apple-card transition-transform duration-300 hover:-translate-y-0.5"
  >
    <p
      class="text-[11px] font-semibold tracking-[0.06em] uppercase"
      :style="{ color: card.eyebrowColor }"
    >
      {{ card.eyebrow }}
    </p>
    <h3 class="mt-2 text-[17.5px] leading-[1.22] font-semibold tracking-[-0.014em] text-balance">
      {{ card.title }}
    </h3>
    <p class="mt-1.5 flex-1 text-[13.5px] leading-[1.45] text-muted">{{ card.body }}</p>

    <div class="mt-5 flex items-center gap-2.5">
      <AppIcon v-if="app" :name="app.icon" :size="34" />
      <span class="min-w-0 flex-1 truncate text-[12.5px] text-muted">{{ card.appNote }}</span>
      <span
        class="shrink-0 rounded-full bg-fill px-3.5 py-[5px] text-[12px] font-semibold text-link transition group-hover:bg-fill-strong"
      >
        View
      </span>
    </div>
  </NuxtLink>
</template>
