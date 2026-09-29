<script setup lang="ts">
defineProps<{ options: string[]; modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
    <button
      v-for="o in options"
      :key="o"
      type="button"
      class="shrink-0 rounded-full px-3.5 py-[6px] text-[13px] font-medium whitespace-nowrap transition"
      :class="
        o === modelValue
          ? 'bg-ink text-canvas'
          : 'bg-fill text-ink/75 hover:bg-fill-strong'
      "
      @click="emit('update:modelValue', o)"
    >
      {{ o }}
    </button>
  </div>
</template>
