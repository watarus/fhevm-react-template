<template>
  <div class="min-h-screen bg-base-100">
    <header class="navbar bg-base-300 shadow-lg">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl" href="/">
          <span class="font-bold">FHEVM</span>
          <span class="ml-2 text-primary">Nuxt Template</span>
        </a>
      </div>
      <div class="flex-none gap-2">
        <ClientOnly>
          <ColorModeToggle />
        </ClientOnly>
        <ClientOnly>
          <WalletConnect />
        </ClientOnly>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>

    <footer class="footer footer-center p-4 bg-base-300 text-base-content mt-8">
      <aside>
        <p>Built with Nuxt 3, Vue 3, and FHEVM SDK</p>
      </aside>
    </footer>
  </div>
</template>

<script setup lang="ts"></script>
