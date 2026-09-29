<script setup lang="ts">
const { online, updateReady, applyUpdate } = usePwa()

/**
 * `online` is corrected before hydration, so the first client render must not
 * depend on it or the markup would differ from the server's. Same reason the
 * theme toggle waits for mount.
 */
const hydrated = ref(false)
onMounted(() => {
  hydrated.value = true
})

const offline = computed(() => hydrated.value && !online.value)
const showUpdate = computed(() => hydrated.value && updateReady.value)
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-[74px] z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6"
    aria-live="polite"
  >
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div
        v-if="offline"
        class="pointer-events-auto flex items-center gap-2.5 rounded-full border border-hairline bg-card/95 py-2 pr-4 pl-3.5 shadow-apple-float frosted"
      >
        <UiIcon name="globe" :size="16" class="text-amber" />
        <p class="text-[13px] font-medium text-ink">
          You’re offline
          <span class="font-normal text-muted">· showing saved content</span>
        </p>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div
        v-if="showUpdate"
        class="pointer-events-auto flex items-center gap-3 rounded-full border border-hairline bg-card/95 py-1.5 pr-1.5 pl-4 shadow-apple-float frosted"
      >
        <p class="text-[13px] font-medium text-ink">A new version is ready</p>
        <button
          type="button"
          class="rounded-full bg-blue px-3.5 py-[5px] text-[12.5px] font-semibold text-white transition hover:bg-blue-hover"
          @click="applyUpdate"
        >
          Reload
        </button>
      </div>
    </Transition>
  </div>
</template>
