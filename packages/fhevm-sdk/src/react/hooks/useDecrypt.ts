/**
 * useDecrypt - React hook for FHE decryption
 *
 * Provides decryption capabilities with EIP-712 signature management
 */

"use client";

import type { ethers } from "ethers";
import { useCallback, useMemo, useRef, useState } from "react";
import { decrypt } from "../../core/decryption";
import type { DecryptionRequest, DecryptionResults } from "../../core/types";
import type { FhevmInstance } from "../../fhevmTypes";
import type { GenericStringStorage } from "../../storage/GenericStringStorage";

export interface UseDecryptParams {
  /**
   * FHEVM instance
   */
  instance: FhevmInstance | undefined;

  /**
   * Ethers signer
   */
  signer: ethers.JsonRpcSigner | undefined;

  /**
   * Storage for decryption signature
   */
  storage: GenericStringStorage;

  /**
   * Chain ID
   */
  chainId: number | undefined;

  /**
   * Decryption requests (handles to decrypt)
   */
  requests: readonly DecryptionRequest[] | undefined;
}

export interface UseDecryptResult {
  /**
   * Whether decryption is possible
   */
  canDecrypt: boolean;

  /**
   * Whether currently decrypting
   */
  isDecrypting: boolean;

  /**
   * Decryption results (handle -> value)
   */
  results: DecryptionResults;

  /**
   * Status message
   */
  message: string;

  /**
   * Error message if any
   */
  error: string | null;

  /**
   * Manually trigger decryption
   */
  decrypt: () => Promise<void>;
}

/**
 * React hook for FHE decryption
 *
 * @param params - Decryption parameters
 * @returns Decryption utilities
 *
 * @example
 * ```typescript
 * import { useDecrypt } from '@fhevm-sdk/react';
 *
 * function MyComponent() {
 *   const { instance } = useFhevm({ ... });
 *   const { signer } = useEthersSigner();
 *   const { storage } = useInMemoryStorage();
 *
 *   const { decrypt, results, isDecrypting } = useDecrypt({
 *     instance,
 *     signer,
 *     storage,
 *     chainId: 31337,
 *     requests: [
 *       { handle: '0x123...', contractAddress: '0xabc...' }
 *     ],
 *   });
 *
 *   const handleDecrypt = async () => {
 *     await decrypt();
 *     console.log('Decrypted value:', results['0x123...']);
 *   };
 *
 *   return <button onClick={handleDecrypt} disabled={isDecrypting}>
 *     Decrypt
 *   </button>;
 * }
 * ```
 */
export function useDecrypt(params: UseDecryptParams): UseDecryptResult {
  const { instance, signer, storage, chainId, requests } = params;

  const [isDecrypting, setIsDecrypting] = useState(false);
  const [results, setResults] = useState<DecryptionResults>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Refs for staleness detection
  const isDecryptingRef = useRef(false);
  const lastReqKeyRef = useRef<string>("");

  // Compute request key for deduplication
  const requestsKey = useMemo(() => {
    if (!requests || requests.length === 0) return "";
    const sorted = [...requests].sort((a, b) =>
      a.handle.localeCompare(b.handle),
    );
    return JSON.stringify(sorted);
  }, [requests]);

  const canDecrypt = useMemo(() => {
    return Boolean(
      instance &&
        signer &&
        storage &&
        chainId &&
        requests &&
        requests.length > 0,
    );
  }, [instance, signer, storage, chainId, requests]);

  // Staleness check helper
  const isStale = useCallback(() => {
    return lastReqKeyRef.current !== requestsKey;
  }, [requestsKey]);

  const doDecrypt = useCallback(async () => {
    if (
      !canDecrypt ||
      !instance ||
      !signer ||
      !requests ||
      isDecryptingRef.current
    ) {
      return;
    }

    isDecryptingRef.current = true;
    lastReqKeyRef.current = requestsKey;
    setIsDecrypting(true);
    setError(null);
    setMessage("Decrypting...");

    try {
      // Load or create EIP-712 signature
      setMessage("Loading decryption signature...");

      const decrypted = await decrypt(instance, requests, signer, storage);

      // Check if stale
      if (isStale()) {
        setMessage("Decryption cancelled (stale request)");
        return;
      }

      setResults(decrypted);
      setMessage("Decryption successful");
      setError(null);
    } catch (err) {
      if (isStale()) {
        setMessage("Decryption cancelled (stale request)");
        return;
      }

      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      setMessage(`Decryption failed: ${errorMsg}`);
    } finally {
      if (!isStale()) {
        setIsDecrypting(false);
        isDecryptingRef.current = false;
      }
    }
  }, [canDecrypt, instance, signer, requests, storage, requestsKey, isStale]);

  return {
    canDecrypt,
    isDecrypting,
    results,
    message,
    error,
    decrypt: doDecrypt,
  };
}
