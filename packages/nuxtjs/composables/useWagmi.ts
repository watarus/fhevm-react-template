/**
 * useWagmi - Nuxt composable for Wagmi wallet connection
 */

import { useAccount, useConnect, useDisconnect } from "@wagmi/vue";
import { ref } from "vue";

export function useWagmi() {
  // SSR guard: return mock values on server
  if (typeof window === "undefined") {
    return {
      address: ref(undefined),
      isConnected: ref(false),
      chainId: ref(undefined),
      connectors: ref([]),
      connect: () => {},
      disconnect: () => {},
    };
  }

  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  console.log("[useWagmi] Initialized on client side");
  console.log("[useWagmi] Initial connectors:", connectors);

  const connectWallet = () => {
    console.log("[useWagmi] connectWallet called");
    console.log("[useWagmi] connectors:", connectors);
    console.log("[useWagmi] connectors.value:", connectors.value);

    // connectors is already a reactive array, no need for .value
    const connectorsArray = connectors.value || connectors;
    console.log("[useWagmi] connectorsArray:", connectorsArray);
    console.log("[useWagmi] connectorsArray.length:", connectorsArray?.length);

    // Use the first available connector (MetaMask/Injected)
    if (connectorsArray && connectorsArray.length > 0) {
      console.log("[useWagmi] Connecting with connector:", connectorsArray[0]);
      connect({ connector: connectorsArray[0] });
    } else {
      console.error(
        "[useWagmi] No connectors available. Make sure MetaMask or another wallet is installed.",
      );
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  return {
    address,
    isConnected,
    chainId,
    connectors,
    connect: connectWallet,
    disconnect: disconnectWallet,
  };
}
