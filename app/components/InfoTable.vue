<script setup lang="ts">
defineProps<{ rows: { label: string; value: string; link?: boolean }[] }>()
</script>

<template>
  <dl>
    <div
      v-for="r in rows"
      :key="r.label"
      class="flex gap-4 border-b border-hairline py-2.5 last:border-b-0"
    >
      <dt class="w-[38%] shrink-0 text-[12.5px] text-muted">{{ r.label }}</dt>
      <dd
        class="min-w-0 flex-1 text-[12.5px] break-words"
        :class="r.link ? 'font-medium text-blue hover:underline' : 'text-ink'"
      >
        {{ r.value }}
      </dd>
    </div>
  </dl>
</template>
