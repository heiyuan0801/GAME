<script setup lang="ts">
const cols = [
  {
    title: 'Shop and Learn',
    links: ['Store', 'Mac', 'iPad', 'iPhone', 'Watch', 'Vision', 'AirPods', 'TV & Home'],
  },
  {
    title: 'Account',
    links: ['Manage Your Apple Account', 'Apple Store Account', 'iCloud.com'],
  },
  {
    title: 'Apple Store',
    links: ['Find a Store', 'Genius Bar', 'Today at Apple', 'Apple Camp', 'Order Status'],
  },
  {
    title: 'For Business',
    links: ['Apple and Business', 'Shop for Business', 'Apple Developer Program'],
  },
  {
    title: 'Apple Values',
    links: ['Accessibility', 'Environment', 'Privacy', 'Supply Chain Innovation'],
  },
]
</script>

<template>
  <footer class="mt-16 border-t border-hairline bg-canvas">
    <div class="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">
      <p class="border-b border-hairline pb-5 text-[11.5px] leading-relaxed text-muted">
        More ways to shop: find an Apple Store or other retailer near you. Or call 1‑800‑MY‑APPLE.
      </p>

      <div class="grid grid-cols-2 gap-6 py-6 sm:grid-cols-3 lg:grid-cols-5">
        <div v-for="c in cols" :key="c.title">
          <!-- h2 rather than h3: on pages whose content has no <h2> these
               headings follow the page <h1> directly, and a skipped level
               breaks the document outline. -->
          <h2 class="mb-2 text-[11.5px] font-semibold text-ink">{{ c.title }}</h2>
          <ul class="space-y-[5px]">
            <li v-for="l in c.links" :key="l">
              <a href="#" class="text-[11.5px] text-muted transition hover:text-ink hover:underline">
                {{ l }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="flex flex-col gap-3 border-t border-hairline pt-5 text-[11.5px] text-muted sm:flex-row sm:items-center sm:justify-between"
      >
        <p>Copyright © 2026 Apple Inc. All rights reserved.</p>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
          <a href="#" class="transition hover:text-ink hover:underline">Privacy Policy</a>
          <a href="#" class="transition hover:text-ink hover:underline">Terms of Use</a>
          <a href="#" class="transition hover:text-ink hover:underline">Sales and Refunds</a>
          <a href="#" class="transition hover:text-ink hover:underline">Legal</a>
          <a href="#" class="transition hover:text-ink hover:underline">Site Map</a>
          <span class="flex items-center gap-1.5">
            <UiIcon name="globe" :size="13" />
            United States
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>
