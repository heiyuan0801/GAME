<template>
  <div class="min-h-dvh bg-canvas">
    <!-- First focusable element on the page: the sidebar is a long list of links,
         so keyboard users need a way past it. Visible only while focused. -->
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-blue focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-on-blue"
    >
      Skip to content
    </a>

    <div class="mx-auto flex w-full max-w-[1440px]">
      <AppSidebar />

      <div class="flex min-w-0 flex-1 flex-col lg:border-l lg:border-hairline/70">
        <TopBar />
        <main id="main" class="flex-1 pb-24 lg:pb-0">
          <slot />
        </main>
        <StoreFooter />
      </div>
    </div>

    <MobileTabBar />
    <OfflineBar />
    <AuthModal />
  </div>
</template>
