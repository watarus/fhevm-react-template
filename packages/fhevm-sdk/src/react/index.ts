/**
 * @fhevm-sdk/react
 *
 * React hooks and components for FHEVM
 * Wagmi-like API for React applications
 */

// Hooks
export {
  useDecrypt,
  type UseDecryptParams,
  type UseDecryptResult,
} from "./hooks/useDecrypt";
export {
  useEncrypt,
  type UseEncryptParams,
  type UseEncryptResult,
} from "./hooks/useEncrypt";
export { useFhevm, type UseFhevmResult } from "./hooks/useFhevm";

// Storage (Context provider)
export {
  InMemoryStorageProvider,
  useInMemoryStorage,
} from "./useInMemoryStorage";

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
  FhevmInstance,
  GenericStringStorage,
} from "../core/index";
