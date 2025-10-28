"use client";

import { useEffect, useMemo, useRef } from "react";
import { ethers } from "ethers";
import { useAccount, useWalletClient, useConfig } from "wagmi";

export const useWagmiEthers = (initialMockChains?: Readonly<Record<number, string>>) => {
  const { address, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const wagmiConfig = useConfig();

  // Determine chainId: use connected chain, or fallback to first configured chain
  const chainId = chain?.id ?? walletClient?.chain?.id ?? (wagmiConfig.chains?.[0]?.id);
  const accounts = address ? [address] : undefined;

  const ethersProvider = useMemo(() => {
    if (!walletClient) return undefined;

    const eip1193Provider = {
      request: async (args: any) => {
        return await walletClient.request(args);
      },
      on: () => {
        console.log("Provider events not fully implemented for wagmi");
      },
      removeListener: () => {
        console.log("Provider removeListener not fully implemented for wagmi");
      },
    } as ethers.Eip1193Provider;

    return new ethers.BrowserProvider(eip1193Provider);
  }, [walletClient]);

  const ethersReadonlyProvider = useMemo(() => {
    // If we have a custom RPC URL for this chain, use it
    const rpcUrl = initialMockChains?.[chainId || 0];
    if (rpcUrl) {
      return new ethers.JsonRpcProvider(rpcUrl);
    }

    // If wallet is connected, use the wallet's provider
    if (ethersProvider) {
      return ethersProvider;
    }

    // Fallback: Create a readonly provider using the chain's default RPC
    // This is crucial for FHEVM SDK initialization before wallet connection
    if (wagmiConfig.chains && wagmiConfig.chains.length > 0) {
      // Use the connected chain if available, otherwise use the first configured chain
      const targetChainId = chainId || wagmiConfig.chains[0].id;
      const targetChain = wagmiConfig.chains.find((c) => c.id === targetChainId);
      if (targetChain?.rpcUrls?.default?.http?.[0]) {
        return new ethers.JsonRpcProvider(targetChain.rpcUrls.default.http[0]);
      }
    }

    return undefined;
  }, [ethersProvider, initialMockChains, chainId, wagmiConfig.chains]);

  // FHEVM-compatible provider: Eip1193Provider | string | ethers.BrowserProvider
  // SDK now accepts BrowserProvider and converts .send() to .request() internally
  const fhevmProvider = useMemo(() => {
    // If we have a custom RPC URL, return it as string
    const rpcUrl = initialMockChains?.[chainId || 0];
    if (rpcUrl) {
      return rpcUrl;
    }

    // If wallet is connected, return ethersProvider (BrowserProvider)
    // SDK's normalizeProvider will handle .send() -> .request() conversion
    if (ethersProvider) {
      return ethersProvider;
    }

    // Fallback: Return RPC URL string for FHEVM SDK
    if (wagmiConfig.chains && wagmiConfig.chains.length > 0) {
      const targetChainId = chainId || wagmiConfig.chains[0].id;
      const targetChain = wagmiConfig.chains.find((c) => c.id === targetChainId);
      if (targetChain?.rpcUrls?.default?.http?.[0]) {
        return targetChain.rpcUrls.default.http[0];
      }
    }

    return undefined;
  }, [ethersProvider, initialMockChains, chainId, wagmiConfig.chains]);

  const ethersSigner = useMemo(() => {
    if (!ethersProvider || !address) return undefined;
    return new ethers.JsonRpcSigner(ethersProvider, address);
  }, [ethersProvider, address]);

  // Stable refs consumers can reuse
  const ropRef = useRef<typeof ethersReadonlyProvider>(ethersReadonlyProvider);
  const chainIdRef = useRef<number | undefined>(chainId);

  useEffect(() => {
    ropRef.current = ethersReadonlyProvider;
  }, [ethersReadonlyProvider]);

  useEffect(() => {
    chainIdRef.current = chainId;
  }, [chainId]);

  return {
    chainId,
    accounts,
    isConnected,
    ethersProvider,
    ethersReadonlyProvider,
    fhevmProvider,
    ethersSigner,
    ropRef,
    chainIdRef,
  } as const;
};
