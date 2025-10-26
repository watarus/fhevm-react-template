/**
 * useEncrypt - Vue composable for encryption operations
 *
 * Provides encryption functionality with builder pattern
 */

import { computed, type Ref, type ComputedRef } from 'vue';
import { createEncryptedInput } from '../../core/encryption';
import type { FhevmInstance } from '../../fhevmTypes';
import type { EncryptionResult } from '../../core/types';

// Import RelayerEncryptedInput type from relayer-sdk
import type { RelayerEncryptedInput } from '@zama-fhe/relayer-sdk/web';

export interface UseEncryptParams {
  /**
   * FHEVM instance
   */
  instance: Ref<FhevmInstance | undefined>;

  /**
   * Ethers signer
   */
  signer: any; // ethers.JsonRpcSigner

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
  encrypt: (buildFn: (builder: RelayerEncryptedInput) => void) => Promise<EncryptionResult | undefined>;
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
    return Boolean(instance.value && signer && contractAddress);
  });

  const encrypt = async (buildFn: (builder: RelayerEncryptedInput) => void): Promise<EncryptionResult | undefined> => {
    if (!instance.value || !signer || !contractAddress) {
      return undefined;
    }

    const userAddress = await signer.getAddress();
    return createEncryptedInput(instance.value, contractAddress, userAddress, buildFn);
  };

  return {
    canEncrypt,
    encrypt,
  };
}
