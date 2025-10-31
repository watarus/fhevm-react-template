<template>
  <div>
    <button
      v-if="!isConnected"
      class="btn btn-primary"
      @click="handleConnect"
      :disabled="isConnecting"
    >
      <span
        v-if="isConnecting"
        class="loading loading-spinner loading-sm"
      ></span>
      {{ isConnecting ? "Connecting..." : "Connect Wallet" }}
    </button>
    <div v-else class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-ghost">
        <div class="flex items-center gap-2">
          <div
            class="w-2 h-2 rounded-full"
            :class="chainId === 31337 ? 'bg-success' : 'bg-warning'"
          ></div>
          {{ shortAddress }}
        </div>
      </label>
      <ul
        tabindex="0"
        class="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-52"
      >
        <li class="menu-title">
          <span>Network: {{ networkName }}</span>
        </li>
        <li v-if="chainId !== 31337">
          <a @click="handleSwitchToHardhat" class="text-warning">
            ⚠️ Switch to Hardhat
          </a>
        </li>
        <li>
          <a @click="handleDisconnect">Disconnect</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSwitchChain } from "@wagmi/vue";
import { hardhat } from "@wagmi/vue/chains";

// SSR guard - only initialize Wagmi hooks on client
const isClient = typeof window !== "undefined";

const {
  address = ref(undefined),
  isConnected = ref(false),
  chainId = ref(undefined),
  connect = () => {},
  disconnect = () => {},
} = isClient ? useWagmi() : {};

const { switchChain = () => {} } = isClient ? useSwitchChain() : {};

const isConnecting = ref(false);

const shortAddress = computed(() => {
  if (!address.value) return "";
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`;
});

const networkName = computed(() => {
  if (!chainId.value) return "Unknown";
  if (chainId.value === 31337) return "Hardhat (localhost)";
  if (chainId.value === 11155111) return "Sepolia";
  if (chainId.value === 1) return "Mainnet";
  return `Chain ${chainId.value}`;
});

const handleConnect = async () => {
  console.log("[WalletConnect] handleConnect called");
  try {
    isConnecting.value = true;
    console.log("[WalletConnect] Calling connect()");
    await connect();
    console.log("[WalletConnect] connect() finished");
  } catch (error) {
    console.error("[WalletConnect] Failed to connect wallet:", error);
  } finally {
    isConnecting.value = false;
    console.log("[WalletConnect] isConnecting set to false");
  }
};

const handleSwitchToHardhat = async () => {
  console.log("[WalletConnect] Switching to Hardhat network");
  try {
    await switchChain({ chainId: hardhat.id });
    console.log("[WalletConnect] Switched to Hardhat network");
  } catch (error) {
    console.error("[WalletConnect] Failed to switch network:", error);
  }
};

const handleDisconnect = () => {
  disconnect();
};
</script>
