/**
 * @fhevm-sdk/vue
 *
 * Vue composables for FHEVM
 * Composable-style API for Vue 3 applications
 */

// Composables
export {
  useDecrypt,
  type UseDecryptParams,
  type UseDecryptResult,
} from "./composables/useDecrypt";
export {
  useEncrypt,
  type UseEncryptParams,
  type UseEncryptResult,
} from "./composables/useEncrypt";
export { useFhevm, type UseFhevmResult } from "./composables/useFhevm";

// Re-export core utilities for convenience
export {
  buildParamsFromAbi,
  createFhevmClient,
  getEncryptionMethod,
  toHex,
} from "../core/index";

// Re-export types
export type {
  DecryptionRequest,
  DecryptionResults,
  EncryptionResult,
  FhevmClient,
  FhevmClientConfig,
  FhevmClientStatus,
} from "../core/types";
