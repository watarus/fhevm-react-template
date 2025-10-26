/**
 * @fhevm-sdk/vue
 *
 * Vue composables for FHEVM
 * Composable-style API for Vue 3 applications
 */

// Composables
export { useFhevm, type UseFhevmResult } from './composables/useFhevm';
export { useEncrypt, type UseEncryptParams, type UseEncryptResult } from './composables/useEncrypt';
export { useDecrypt, type UseDecryptParams, type UseDecryptResult } from './composables/useDecrypt';

// Re-export core utilities for convenience
export {
  createFhevmClient,
  getEncryptionMethod,
  toHex,
  buildParamsFromAbi,
} from '../core/index';

// Re-export types
export type {
  FhevmClientConfig,
  FhevmClientStatus,
  FhevmClient,
  EncryptionResult,
  DecryptionRequest,
  DecryptionResults,
} from '../core/types';
