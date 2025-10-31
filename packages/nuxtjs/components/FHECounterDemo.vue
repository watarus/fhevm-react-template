<template>
  <div class="w-full max-w-6xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-3xl mb-4">
          🔐 FHE Counter Demo
          <span class="badge badge-primary">Vue 3 + FHEVM SDK</span>
        </h2>

        <!-- Connection Status -->
        <div class="alert" :class="alertClass">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="stroke-current shrink-0 w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>{{ statusMessage }}</span>
        </div>

        <!-- Counter Display -->
        <div class="stats shadow my-4">
          <div class="stat">
            <div class="stat-title">Encrypted Counter Value</div>
            <div class="stat-value text-primary">
              {{ decryptedValue !== undefined ? decryptedValue : "???" }}
            </div>
            <div class="stat-desc">
              {{ isDecrypting ? "Decrypting..." : "Decrypted value" }}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions justify-center gap-4 mt-4">
          <button
            class="btn btn-success btn-lg"
            :disabled="!canInteract || isIncrementing"
            @click="handleIncrement"
          >
            <span v-if="isIncrementing" class="loading loading-spinner"></span>
            {{ isIncrementing ? "Incrementing..." : "➕ Increment" }}
          </button>

          <button
            class="btn btn-error btn-lg"
            :disabled="!canInteract || isDecrementing"
            @click="handleDecrement"
          >
            <span v-if="isDecrementing" class="loading loading-spinner"></span>
            {{ isDecrementing ? "Decrementing..." : "➖ Decrement" }}
          </button>

          <button
            class="btn btn-info btn-lg"
            :disabled="!canDecrypt || isDecrypting"
            @click="handleDecrypt"
          >
            <span v-if="isDecrypting" class="loading loading-spinner"></span>
            {{ isDecrypting ? "Decrypting..." : "🔓 Decrypt" }}
          </button>
        </div>

        <!-- Message Display -->
        <div v-if="message" class="alert alert-info mt-4">
          <span>{{ message }}</span>
        </div>

        <!-- Network Info -->
        <div class="divider"></div>
        <div class="text-sm opacity-70">
          <p>Network: {{ network }}</p>
          <p v-if="contractAddress">Contract: {{ contractAddress }}</p>
          <p>FHEVM Status: {{ fhevmStatus }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFHECounter } from "~/composables/useFHECounter";
import { getMockChains } from "~/config/fhevm";

const mockChains = getMockChains();

const {
  // State
  decryptedValue,
  message,
  fhevmStatus,
  contractAddress,
  network,

  // Loading states
  isIncrementing,
  isDecrementing,
  isDecrypting,

  // Actions
  increment,
  decrement,
  decrypt,

  // Computed
  canInteract,
  canDecrypt,
} = useFHECounter({ initialMockChains: mockChains });

const handleIncrement = async () => {
  await increment(1);
};

const handleDecrement = async () => {
  await decrement(1);
};

const handleDecrypt = async () => {
  await decrypt();
};

const statusMessage = computed(() => {
  if (fhevmStatus.value === "ready") {
    return "✅ FHEVM SDK Ready";
  }
  if (fhevmStatus.value === "connecting") {
    return "⏳ Connecting to FHEVM...";
  }
  if (fhevmStatus.value === "error") {
    return "❌ FHEVM Error - Check console";
  }
  return "⏸️ FHEVM Idle";
});

const alertClass = computed(() => {
  if (fhevmStatus.value === "ready") return "alert-success";
  if (fhevmStatus.value === "error") return "alert-error";
  if (fhevmStatus.value === "connecting") return "alert-warning";
  return "alert-info";
});
</script>
