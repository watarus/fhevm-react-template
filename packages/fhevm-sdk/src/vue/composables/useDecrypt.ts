/**
 * useDecrypt - Vue composable for decryption operations
 *
 * Provides decryption functionality with automatic signature management
 */

import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
import { decrypt } from "../../core/decryption";
import type { DecryptionRequest, DecryptionResults } from "../../core/types";
import type { FhevmInstance } from "../../fhevmTypes";

export interface UseDecryptParams {
  /**
   * FHEVM instance
   */
  instance: Ref<FhevmInstance | undefined>;

  /**
   * Ethers signer
   */
  signer: any; // ethers.JsonRpcSigner

  /**
   * Decryption requests (handles to decrypt)
   */
  requests: Ref<readonly DecryptionRequest[]> | readonly DecryptionRequest[];

  /**
   * Storage for signatures
   */
  storage: any; // GenericStringStorage
}

export interface UseDecryptResult {
  /**
   * Whether decryption is available
   */
  canDecrypt: ComputedRef<boolean>;

  /**
   * Whether currently decrypting
   */
  isDecrypting: Ref<boolean>;

  /**
   * Decryption results (handle -> decrypted value)
   */
  results: Ref<DecryptionResults>;

  /**
   * Status message
   */
  message: Ref<string | undefined>;

  /**
   * Error message
   */
  error: Ref<string | undefined>;

  /**
   * Perform decryption
   */
  decrypt: () => Promise<void>;
}

/**
 * Vue composable for decryption operations
 *
 * @param params - Decryption parameters
 * @returns Decryption utilities
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { useFhevm, useDecrypt } from '@fhevm-sdk/vue';
 *
 * const { instance } = useFhevm({ network, chainId });
 * const requests = ref([
 *   { handle: '0xabc...', contractAddress: '0x123...' }
 * ]);
 *
 * const { decrypt, canDecrypt, results, isDecrypting } = useDecrypt({
 *   instance,
 *   signer,
 *   requests,
 *   storage,
 * });
 * </script>
 *
 * <template>
 *   <button @click="decrypt" :disabled="!canDecrypt">
 *     {{ isDecrypting ? 'Decrypting...' : 'Decrypt' }}
 *   </button>
 *   <div v-if="results">Result: {{ results['0xabc...'] }}</div>
 * </template>
 * ```
 */
export function useDecrypt(params: UseDecryptParams): UseDecryptResult {
  const { instance, signer, requests: requestsInput, storage } = params;

  const isDecrypting = ref(false);
  const results = ref<DecryptionResults>({});
  const message = ref<string | undefined>(undefined);
  const error = ref<string | undefined>(undefined);

  // Handle both Ref and plain array
  const requests =
    "value" in requestsInput ? requestsInput : ref(requestsInput);

  // Track if decryption is in progress
  let isDecryptingInternal = false;
  let lastReqKey = "";

  // Compute requests key for staleness detection
  const requestsKey = computed(() => {
    if (!requests.value || requests.value.length === 0) return "";
    const sorted = [...requests.value].sort((a, b) =>
      a.handle.localeCompare(b.handle),
    );
    return JSON.stringify(sorted);
  });

  // Check if current operation is stale
  const isStale = () => {
    return lastReqKey !== requestsKey.value;
  };

  const canDecrypt = computed(() => {
    return Boolean(
      instance.value &&
        signer &&
        storage &&
        requests.value &&
        requests.value.length > 0 &&
        !isDecryptingInternal,
    );
  });

  const doDecrypt = async () => {
    if (!canDecrypt.value) {
      return;
    }

    isDecryptingInternal = true;
    isDecrypting.value = true;
    lastReqKey = requestsKey.value;
    message.value = "Decrypting...";
    error.value = undefined;

    try {
      const decrypted = await decrypt(
        instance.value!,
        requests.value,
        signer,
        storage,
      );

      // Check if stale (requests changed during decryption)
      if (isStale()) {
        message.value = "Decryption cancelled (stale request)";
        return;
      }

      results.value = decrypted;
      message.value = "Decryption successful";
    } catch (err) {
      // Check if stale
      if (isStale()) {
        message.value = "Decryption cancelled (stale request)";
        return;
      }

      const errMsg = err instanceof Error ? err.message : String(err);
      error.value = `Decryption failed: ${errMsg}`;
      message.value = "Decryption failed";
    } finally {
      if (!isStale()) {
        isDecrypting.value = false;
        isDecryptingInternal = false;
      }
    }
  };

  // Watch requests changes and clear results
  watch(requestsKey, () => {
    results.value = {};
    error.value = undefined;
  });

  return {
    canDecrypt,
    isDecrypting,
    results,
    message,
    error,
    decrypt: doDecrypt,
  };
}
