<template>
  <div class="flex flex-col gap-8 items-center sm:items-start w-full">
    <!-- New Universal FHEVM SDK API Demo -->
    <ClientOnly>
      <FHECounterDemo />
    </ClientOnly>

    <!-- Separator -->
    <div
      class="w-full max-w-6xl mx-auto my-8 border-t-4 border-dashed border-gray-300"
    />

    <!-- Info Section -->
    <div class="w-full max-w-6xl mx-auto">
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">About FHEVM</h2>
          <p>
            This is a demo of Fully Homomorphic Encryption (FHE) on Ethereum
            using Zama's FHEVM. The counter value is encrypted on-chain, and
            only you can decrypt it.
          </p>
          <div class="divider"></div>
          <h3 class="font-bold">Features:</h3>
          <ul class="list-disc list-inside space-y-2">
            <li>🔒 Encrypted counter stored on-chain</li>
            <li>🔑 Only you can decrypt your encrypted values</li>
            <li>⚡ Increment/Decrement operations work on encrypted data</li>
            <li>
              🌐 Network switching (Hardhat/Sepolia) via environment variables
            </li>
            <li>✨ Built with Vue 3 Composition API and FHEVM SDK</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
