<script setup lang="ts">
const props = defineProps<{ options: string[]; modelValue?: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const active = computed(() => props.modelValue ?? props.options[0])
</script>

<template>
  <div
    class="inline-flex items-center gap-0.5 rounded-[9px] bg-fill p-[3px]"
    role="tablist"
  >
    <button
      v-for="o in options"
      :key="o"
      type="button"
      role="tab"
      :aria-selected="o === active"
      class="rounded-[7px] px-3.5 py-[5px] text-[13px] transition"
      :class="
        o === active
          ? 'bg-card font-semibold text-ink shadow-apple-pill'
          : 'font-medium text-ink/65 hover:text-ink'
      "
      @click="emit('update:modelValue', o)"
    >
      {{ o }}
    </button>
  </div>
</template>
