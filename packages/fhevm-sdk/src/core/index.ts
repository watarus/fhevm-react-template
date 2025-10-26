/**
 * @fhevm-sdk/core
 *
 * Framework-agnostic FHEVM SDK core
 * Use this for custom framework integrations or Node.js applications
 */

// Client
export { FhevmClient, createFhevmClient } from "./client";
export { EventEmitter } from "./EventEmitter";

// Encryption
export {
  createEncryptedInput,
  getEncryptionMethod,
  toHex,
  buildParamsFromAbi,
} from "./encryption";

// Decryption
export { decrypt, hasValidSignature } from "./decryption";

// Types
export type {
  FhevmClient as IFhevmClient,
  FhevmClientConfig,
  FhevmClientStatus,
  FhevmClientEvents,
  EventEmitter as IEventEmitter,
  StorageAdapter,
  EncryptionResult,
  EncryptionParams,
  DecryptionRequest,
  DecryptionResults,
  DecryptionParams,
} from "./types";

// Re-export common types from fhevmTypes
export type { FhevmInstance, FhevmInstanceConfig, HandleContractPair } from "../fhevmTypes";

// Re-export storage interfaces
export type { GenericStringStorage } from "../storage/GenericStringStorage";
export { GenericStringInMemoryStorage } from "../storage/GenericStringStorage";

// Re-export decryption signature (useful for advanced use cases)
export { FhevmDecryptionSignature } from "../FhevmDecryptionSignature";
