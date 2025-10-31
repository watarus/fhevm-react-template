/**
 * useEncrypt - Vue composable for encryption operations
 *
 * Provides encryption functionality with builder pattern
 */

import type { BrowserProvider } from "ethers";
import { computed, toRaw, unref, type ComputedRef, type Ref } from "vue";
import { createEncryptedInput } from "../../core/encryption";
import type { EncryptionResult } from "../../core/types";
import type { FhevmInstance } from "../../fhevmTypes";

// Import RelayerEncryptedInput type from relayer-sdk
import type { RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";

export interface UseEncryptParams {
  /**
   * FHEVM instance
   */
  instance: Ref<FhevmInstance | undefined>;

  /**
   * Ethers BrowserProvider - will call getSigner() internally
   */
  signer: BrowserProvider | Ref<BrowserProvider | undefined> | undefined;

  /**
   * Contract address
   */
  contractAddress: string;
}

export interface UseEncryptResult {
  /**
   * Whether encryption is available
   */
  canEncrypt: ComputedRef<boolean>;

  /**
   * Encrypt data using builder pattern
   *
   * @param buildFn - Function that builds the encrypted input
   * @returns Encrypted result or undefined if not ready
   *
   * @example
   * ```typescript
   * const encrypted = await encrypt((input) => {
   *   input.add64(42);
   *   input.add32(100);
   * });
   * ```
   */
  encrypt: (
    buildFn: (builder: RelayerEncryptedInput) => void,
  ) => Promise<EncryptionResult | undefined>;
}

/**
 * Vue composable for encryption operations
 *
 * @param params - Encryption parameters
 * @returns Encryption utilities
 *
 * @example
 * ```vue
 * <script setup>
 * import { useFhevm, useEncrypt } from '@fhevm-sdk/vue';
 *
 * const { instance } = useFhevm({ network, chainId });
 * const { encrypt, canEncrypt } = useEncrypt({
 *   instance,
 *   signer,
 *   contractAddress: '0x123...',
 * });
 *
 * async function handleEncrypt() {
 *   const encrypted = await encrypt((input) => {
 *     input.add64(42);
 *   });
 * }
 * </script>
 * ```
 */
export function useEncrypt(params: UseEncryptParams): UseEncryptResult {
  const { instance, signer, contractAddress } = params;

  const canEncrypt = computed(() => {
    const resolvedInstance = instance.value && toRaw(instance.value);
    const resolvedSigner = signer ? toRaw(unref(signer)) : undefined;
    return Boolean(resolvedInstance && resolvedSigner && contractAddress);
  });

  const encrypt = async (
    buildFn: (builder: RelayerEncryptedInput) => void,
  ): Promise<EncryptionResult | undefined> => {
    const resolvedInstance = instance.value && toRaw(instance.value);
    const resolvedSigner = signer ? toRaw(unref(signer)) : undefined;
    if (!resolvedInstance || !resolvedSigner || !contractAddress) {
      return undefined;
    }

    // Get the actual signer from the BrowserProvider (already protected by markRaw)
    const actualSigner = await resolvedSigner.getSigner();
    const userAddress = await actualSigner.getAddress();
    return createEncryptedInput(
      resolvedInstance,
      contractAddress,
      userAddress,
      buildFn,
    );
  };

  return {
    canEncrypt,
    encrypt,
  };
}
