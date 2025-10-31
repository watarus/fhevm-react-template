/**
 * useWagmiEthers - Vue composable for Wagmi-Ethers integration
 * Provides FHEVM-compatible provider from Wagmi wallet connection
 */

import { useAccount, useConnectorClient } from "@wagmi/vue";
import { ethers } from "ethers";
import { computed, markRaw, ref, shallowRef } from "vue";

// Default RPC URLs for fallback
const DEFAULT_RPC_URLS: Record<number, string> = {
  31337: "http://localhost:8545", // Hardhat
  11155111: "https://sepolia.drpc.org", // Sepolia
  1: "https://eth.drpc.org", // Mainnet
};

export function useWagmiEthers(
  initialMockChains?: Readonly<Record<number, string>>,
) {
  // SSR guard: return mock values on server
  if (typeof window === "undefined") {
    return {
      chainId: ref(31337),
      accounts: ref(undefined),
      isConnected: ref(false),
      ethersProvider: ref(undefined),
      ethersReadonlyProvider: ref(undefined),
      fhevmProvider: ref(initialMockChains?.[31337] || DEFAULT_RPC_URLS[31337]),
      ethersSigner: ref(undefined),
    };
  }

  const { address, isConnected, chain } = useAccount();
  const { data: connectorClient } = useConnectorClient();

  // Determine chainId: use connected chain, or fallback to Hardhat
  const chainId = computed(() => {
    return chain.value?.id ?? connectorClient.value?.chain?.id ?? 31337;
  });

  // Accounts array
  const accounts = computed(() => {
    return address.value ? [address.value] : undefined;
  });

  // Track ethersProvider creation (use shallowRef to avoid proxying ethers objects)
  const ethersProviderRef = shallowRef<ethers.BrowserProvider | undefined>(
    undefined,
  );
  const prevConnectorClient = ref<typeof connectorClient.value>(undefined);

  // Create ethersProvider from connectorClient
  const ethersProvider = computed(() => {
    if (!connectorClient.value) {
      ethersProviderRef.value = undefined;
      prevConnectorClient.value = undefined;
      return undefined;
    }

    // Only create new instance if connectorClient reference actually changed
    if (connectorClient.value !== prevConnectorClient.value) {
      const eip1193Provider = {
        request: async (args: any) => {
          return await connectorClient.value!.request(args);
        },
        on: () => {
          console.log("Provider events not fully implemented for wagmi");
        },
        removeListener: () => {
          console.log(
            "Provider removeListener not fully implemented for wagmi",
          );
        },
      } as ethers.Eip1193Provider;

      ethersProviderRef.value = markRaw(
        new ethers.BrowserProvider(eip1193Provider),
      );
      prevConnectorClient.value = connectorClient.value;
    }

    return ethersProviderRef.value;
  });

  // Readonly provider for read operations
  const ethersReadonlyProvider = computed(() => {
    const currentChainId = chainId.value || 31337;

    // If we have a custom RPC URL for this chain, use it
    const rpcUrl = initialMockChains?.[currentChainId];
    if (rpcUrl) {
      return markRaw(new ethers.JsonRpcProvider(rpcUrl));
    }

    // If wallet is connected, use the wallet's provider
    if (ethersProvider.value) {
      return ethersProvider.value;
    }

    // Fallback: Use default RPC URL
    const defaultRpcUrl = DEFAULT_RPC_URLS[currentChainId];
    if (defaultRpcUrl) {
      return markRaw(new ethers.JsonRpcProvider(defaultRpcUrl));
    }

    return undefined;
  });

  // FHEVM-compatible provider: Eip1193Provider | string | ethers.BrowserProvider
  const fhevmProvider = computed(() => {
    const currentChainId = chainId.value || 31337;

    // 1. Priority: If wallet is connected, return ethersProvider (BrowserProvider)
    if (ethersProvider.value) {
      console.log("[useWagmiEthers] Using ethersProvider (BrowserProvider)");
      return ethersProvider.value;
    }

    // 2. If we have a custom RPC URL, return it as string
    const rpcUrl = initialMockChains?.[currentChainId];
    if (rpcUrl) {
      console.log("[useWagmiEthers] Using custom RPC URL:", rpcUrl);
      return rpcUrl;
    }

    // 3. Fallback: Return default RPC URL string for FHEVM SDK
    const defaultRpcUrl = DEFAULT_RPC_URLS[currentChainId];
    if (defaultRpcUrl) {
      console.log("[useWagmiEthers] Using fallback RPC URL:", defaultRpcUrl);
      return defaultRpcUrl;
    }

    console.log("[useWagmiEthers] No provider available, returning undefined");
    return undefined;
  });

  // Signer for write operations
  // Return the BrowserProvider itself - it will be used to get the signer when needed
  const ethersSigner = computed(() => {
    if (!ethersProvider.value || !address.value) return undefined;
    // Return the provider - useEncrypt will call getSigner() when needed
    return ethersProvider.value;
  });

  return {
    chainId,
    accounts,
    isConnected,
    ethersProvider,
    ethersReadonlyProvider,
    fhevmProvider,
    ethersSigner,
  };
}
