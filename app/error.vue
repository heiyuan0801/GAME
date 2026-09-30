<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

useHead({ title: `${props.error.statusCode} — App Store` })
</script>

<template>
  <div class="min-h-dvh bg-canvas">
    <TopBar />
    <main class="mx-auto grid max-w-[720px] place-items-center px-6 py-24 text-center">
      <span
        class="grid h-14 w-14 place-items-center rounded-[16px] text-white"
        style="background: linear-gradient(160deg, #1f9bf7 0%, #0a6ae0 100%)"
      >
        <UiIcon name="appstore" :size="28" />
      </span>
      <p class="mt-6 text-[13px] font-semibold tracking-[0.06em] text-muted uppercase">
        Error {{ error.statusCode }}
      </p>
      <h1 class="mt-2 text-[30px] leading-tight font-bold tracking-[-0.022em] sm:text-[38px]">
        {{ error.statusCode === 404 ? 'We couldn’t find that page.' : 'Something went wrong.' }}
      </h1>
      <p class="mt-3 max-w-[44ch] text-[14px] leading-[1.55] text-muted">
        {{
          error.statusCode === 404
            ? 'The app, chart or category you’re looking for may have been moved or removed from the storefront.'
            : 'Please try again in a moment.'
        }}
      </p>
      <NuxtLink
        to="/"
        class="mt-7 rounded-full bg-blue px-5 py-2.5 text-[14px] font-semibold text-on-blue transition hover:bg-blue-hover"
      >
        Back to Today
      </NuxtLink>
    </main>
    <StoreFooter />
  </div>
</template>
