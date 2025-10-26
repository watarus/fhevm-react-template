/**
 * @fhevm-sdk/react
 *
 * React hooks and components for FHEVM
 * Wagmi-like API for React applications
 */

// Hooks
export { useFhevm, type UseFhevmResult } from "./hooks/useFhevm";
export { useEncrypt, type UseEncryptParams, type UseEncryptResult } from "./hooks/useEncrypt";
export { useDecrypt, type UseDecryptParams, type UseDecryptResult } from "./hooks/useDecrypt";

// Storage (Context provider)
export { useInMemoryStorage, InMemoryStorageProvider } from "./useInMemoryStorage";

// Re-export core utilities for convenience
export {
  createFhevmClient,
  getEncryptionMethod,
  toHex,
  buildParamsFromAbi,
} from "../core/index";

// Re-export types
export type {
  FhevmClient,
  FhevmClientConfig,
  FhevmClientStatus,
  FhevmInstance,
  EncryptionResult,
  DecryptionRequest,
  DecryptionResults,
  GenericStringStorage,
} from "../core/index";
