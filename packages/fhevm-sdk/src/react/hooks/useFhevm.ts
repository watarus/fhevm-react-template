/**
 * useFhevm - React hook for FHEVM client
 *
 * Manages FHEVM instance lifecycle in React applications
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { createFhevmClient, type FhevmClient } from "../../core/client";
import type { FhevmClientConfig, FhevmClientStatus } from "../../core/types";
import type { FhevmInstance } from "../../fhevmTypes";

export interface UseFhevmResult {
  /**
   * FHEVM instance (available when status is 'ready')
   */
  instance: FhevmInstance | undefined;

  /**
   * Current client status
   */
  status: FhevmClientStatus;

  /**
   * Error if any
   */
  error: Error | undefined;

  /**
   * FHEVM client (for advanced use cases)
   */
  client: FhevmClient | undefined;

  /**
   * Manually trigger reconnection
   */
  reconnect: () => Promise<void>;

  /**
   * Alias for reconnect (backward compatibility)
   */
  refresh: () => void;
}

/**
 * React hook for FHEVM instance management
 *
 * @param config - FHEVM client configuration
 * @returns FHEVM instance and status
 *
 * @example Basic usage
 * ```typescript
 * import { useFhevm } from '@fhevm-sdk/react';
 *
 * function MyComponent() {
 *   const { instance, status } = useFhevm({
 *     network: window.ethereum,
 *     chainId: 31337,
 *   });
 *
 *   if (status === 'ready' && instance) {
 *     // Use instance for encryption/decryption
 *   }
 *
 *   return <div>Status: {status}</div>;
 * }
 * ```
 *
 * @example Wagmi integration (zero-config!)
 * ```typescript
 * import { useFhevm } from '@fhevm-sdk/react';
 * import { useWalletClient } from 'wagmi';
 *
 * function MyComponent() {
 *   const { data: walletClient } = useWalletClient();
 *
 *   // Works directly with WalletClient - no adapter needed!
 *   const { instance, status } = useFhevm({
 *     network: walletClient,
 *     fallbackRpc: 'http://localhost:8545', // For pre-connection
 *     chainId: 31337,
 *   });
 *
 *   return <div>Status: {status}</div>;
 * }
 * ```
 */
export function useFhevm(
  config: FhevmClientConfig | { provider?: any; initialMockChains?: any; enabled?: boolean; [key: string]: any }
): UseFhevmResult {
  const [instance, setInstance] = useState<FhevmInstance | undefined>(undefined);
  const [status, setStatus] = useState<FhevmClientStatus>("idle");
  const [error, setError] = useState<Error | undefined>(undefined);
  const clientRef = useRef<FhevmClient | undefined>(undefined);

  // Normalize config to support both old API (provider, initialMockChains) and new API (network, mockChains)
  const normalizedConfig: FhevmClientConfig = {
    network: (config as any).network || (config as any).provider,
    chainId: config.chainId,
    mockChains: (config as any).mockChains || (config as any).initialMockChains,
    debug: config.debug,
  };

  const { network, chainId, mockChains, debug } = normalizedConfig;

  useEffect(() => {
    // Create client
    const client = createFhevmClient({
      network,
      chainId,
      mockChains,
      debug,
    });

    clientRef.current = client;

    // Set up event listeners
    client.on("statusChange", setStatus);
    client.on("ready", (inst) => {
      setInstance(inst);
      setError(undefined);
    });
    client.on("error", (err) => {
      setError(err);
      setInstance(undefined);
    });
    client.on("disconnect", () => {
      setInstance(undefined);
      setError(undefined);
    });

    // Start connection
    client.connect().catch((err) => {
      // Error is already handled by 'error' event
      console.error("[useFhevm] Connection failed:", err);
    });

    // Cleanup on unmount or config change
    return () => {
      client.disconnect();
      client.removeAllListeners();
    };
  }, [network, chainId, mockChains, debug]);

  const reconnect = async () => {
    if (clientRef.current) {
      await clientRef.current.reconnect();
    }
  };

  // Alias for backward compatibility
  const refresh = () => {
    reconnect().catch((err) => {
      console.error("[useFhevm] Refresh failed:", err);
    });
  };

  return {
    instance,
    status,
    error,
    client: clientRef.current,
    reconnect,
    refresh,
  };
}
