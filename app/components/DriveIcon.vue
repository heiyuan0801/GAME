<script setup lang="ts">
import { DRIVE_MARKS, type Drive } from '~/data/drives'

/**
 * Cloud-drive brand tile: a coloured rounded square with a simplified white
 * mark. Same idea as `AppIcon`, but these are squarer and carry no hairline
 * ring — they are logos, not app artwork.
 */
withDefaults(defineProps<{ drive: Drive; size?: number }>(), { size: 42 })
</script>

<template>
  <span
    class="grid shrink-0 place-items-center"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      background: drive.color,
      borderRadius: `${Math.round(size * 0.27)}px`,
    }"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 48 48"
      :width="Math.round(size * 0.62)"
      :height="Math.round(size * 0.62)"
      v-html="DRIVE_MARKS[drive.id]"
    />
  </span>
</template>
