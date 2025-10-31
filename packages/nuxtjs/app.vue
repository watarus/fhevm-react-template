<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Set page title and meta
useHead({
  title: "FHEVM Nuxt Template",
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    {
      name: "description",
      content: "FHEVM Fully Homomorphic Encryption demo with Nuxt.js and Vue",
    },
  ],
  link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
});
</script>
