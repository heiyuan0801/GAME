<script setup lang="ts">
import { DRIVES, downloadUrl, driveHost } from '~/data/drives'
</script>

<template>
  <section>
    <SectionHeading eyebrow="网盘下载" title="Download sources" />

    <p class="mb-4 max-w-[68ch] text-[13.5px] leading-[1.55] text-muted">
      Prefer a cloud drive? Every option below opens the provider's site in a new tab. Availability
      and speed depend on the provider and your region.
    </p>

    <ul class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      <li v-for="drive in DRIVES" :key="drive.id">
        <a
          :href="downloadUrl(drive)"
          target="_blank"
          rel="noopener noreferrer"
          :title="`Open ${drive.name} — ${driveHost(drive)}`"
          class="group flex h-full items-center gap-3 rounded-[14px] border border-hairline bg-card p-3 transition hover:border-blue/40 hover:bg-fill-subtle"
        >
          <DriveIcon :drive="drive" />

          <span class="min-w-0 flex-1">
            <span class="block truncate text-[13.5px] font-semibold text-ink">{{ drive.name }}</span>
            <span class="block truncate text-[11.5px] text-muted">{{ drive.nameEn }}</span>
          </span>

          <UiIcon
            name="arrowUpRight"
            :size="15"
            class="shrink-0 text-muted transition group-hover:text-link"
          />
          <span class="sr-only">(opens in a new tab)</span>
        </a>
      </li>
    </ul>

    <p class="mt-3 flex items-start gap-1.5 text-[11.5px] leading-[1.5] text-muted">
      <UiIcon name="info" :size="13" class="mt-px shrink-0" />
      Demo — these point at each provider's own site. A real build would resolve per-app share links
      from an API.
    </p>
  </section>
</template>
