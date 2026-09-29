<script setup lang="ts">
/**
 * App icon — Apple continuous-curve squircle with a simplified vector mark.
 * `size` accepts a number (px) or any CSS length.
 */
const props = withDefaults(
  defineProps<{
    /** key into the logo registry, or an app id */
    name: string
    size?: number | string
    /** override the registry background */
    bg?: string
    /** hairline inset ring, on by default like the App Store */
    ring?: boolean
    radius?: string
  }>(),
  { size: 64, ring: true },
)

const dim = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
const mark = computed(() => LOGOS[props.name] ?? '')
const background = computed(() => props.bg ?? ICON_BG[props.name] ?? '#8e8e93')
const radius = computed(() => props.radius ?? (props.ring ? '22.37%' : '22.37%'))
const isLight = computed(() => /#fff|white|gradient\([^)]*#f/i.test(background.value))
</script>

<template>
  <span
    class="relative inline-block shrink-0 overflow-hidden"
    :style="{
      width: dim,
      height: dim,
      background,
      borderRadius: radius,
      boxShadow: ring
        ? 'inset 0 0 0 1px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)'
        : undefined,
    }"
  >
    <svg
      viewBox="0 0 48 48"
      class="absolute inset-0 h-full w-full"
      :style="{ color: isLight ? '#1d1d1f' : '#fff' }"
      v-html="mark"
    />
  </span>
</template>
