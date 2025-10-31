/**
 * useEncrypt - React hook for FHE encryption
 *
 * Provides encryption capabilities for React applications
 */

"use client";

import type { RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";
import type { ethers } from "ethers";
import { useCallback, useMemo } from "react";
import { createEncryptedInput } from "../../core/encryption";
import type { EncryptionResult } from "../../core/types";
import type { FhevmInstance } from "../../fhevmTypes";

export interface UseEncryptParams {
  /**
   * FHEVM instance
   */
  instance: FhevmInstance | undefined;

  /**
   * Ethers signer
   */
  signer: ethers.JsonRpcSigner | undefined;

  /**
   * Contract address
   */
  contractAddress: string | undefined;
}

export interface UseEncryptResult {
  /**
   * Whether encryption is possible (all params are available)
   */
  canEncrypt: boolean;

  /**
   * Encrypt data using a builder function
   *
   * @param buildFn - Function to configure encrypted input
   * @returns Encryption result with handles and proof
   *
   * @example
   * ```typescript
   * const encrypted = await encrypt((builder) => {
   *   builder.add64(42);
   *   builder.add32(100);
   * });
   * ```
   */
  encrypt: (
    buildFn: (builder: RelayerEncryptedInput) => void,
  ) => Promise<EncryptionResult | undefined>;
}

/**
 * React hook for FHE encryption
 *
 * @param params - Encryption parameters
 * @returns Encryption utilities
 *
 * @example
 * ```typescript
 * import { useEncrypt } from '@fhevm-sdk/react';
 *
 * function MyComponent() {
 *   const { instance } = useFhevm({ ... });
 *   const { signer } = useEthersSigner();
 *
 *   const { encrypt, canEncrypt } = useEncrypt({
 *     instance,
 *     signer,
 *     contractAddress: '0x123...',
 *   });
 *
 *   const handleEncrypt = async () => {
 *     if (!canEncrypt) return;
 *
 *     const result = await encrypt((builder) => {
 *       builder.add64(42);
 *     });
 *
 *     // Use result.handles and result.inputProof for contract call
 *   };
 *
 *   return <button onClick={handleEncrypt} disabled={!canEncrypt}>
 *     Encrypt
 *   </button>;
 * }
 * ```
 */
export function useEncrypt(params: UseEncryptParams): UseEncryptResult {
  const { instance, signer, contractAddress } = params;

  const canEncrypt = useMemo(
    () => Boolean(instance && signer && contractAddress),
    [instance, signer, contractAddress],
  );

  const encrypt = useCallback(
    async (buildFn: (builder: RelayerEncryptedInput) => void) => {
      if (!instance || !signer || !contractAddress) {
        return undefined;
      }

      const userAddress = await signer.getAddress();

      return createEncryptedInput(
        instance,
        contractAddress,
        userAddress,
        buildFn,
      );
    },
    [instance, signer, contractAddress],
  );

  return {
    canEncrypt,
    encrypt,
  };
}
