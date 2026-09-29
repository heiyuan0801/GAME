<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; to: string }>()
</script>

<template>
  <section class="rounded-[22px] bg-card p-4 shadow-apple-card sm:p-5">
    <NuxtLink :to="to" class="group mb-2 flex items-start justify-between gap-3 px-2">
      <div>
        <p class="text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
          {{ eyebrow }}
        </p>
        <h3
          class="mt-1 flex items-center gap-1 text-[19px] font-semibold tracking-[-0.015em] transition group-hover:text-blue"
        >
          {{ title }}
          <UiIcon
            name="chevronRight"
            :size="16"
            class="mt-0.5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-blue"
          />
        </h3>
      </div>
    </NuxtLink>
    <div class="space-y-0.5">
      <slot />
    </div>
  </section>
</template>
