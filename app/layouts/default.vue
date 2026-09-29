<template>
  <div class="min-h-dvh bg-canvas">
    <div class="mx-auto flex w-full max-w-[1440px]">
      <AppSidebar />

      <div class="flex min-w-0 flex-1 flex-col lg:border-l lg:border-hairline/70">
        <TopBar />
        <main class="flex-1 pb-24 lg:pb-0">
          <slot />
        </main>
        <StoreFooter />
      </div>
    </div>

    <MobileTabBar />
    <OfflineBar />
  </div>
</template>
