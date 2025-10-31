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
  buildParamsFromAbi,
  createEncryptedInput,
  getEncryptionMethod,
  toHex,
} from "./encryption";
export type { RelayerEncryptedInputMethod } from "./encryption";

// Decryption
export { decrypt, hasValidSignature } from "./decryption";

// Types
export type {
  DecryptionParams,
  DecryptionRequest,
  DecryptionResults,
  EncryptionParams,
  EncryptionResult,
  FhevmClientConfig,
  FhevmClientEvents,
  FhevmClientStatus,
  EventEmitter as IEventEmitter,
  FhevmClient as IFhevmClient,
  StorageAdapter,
} from "./types";

// Re-export common types from fhevmTypes
export type {
  FhevmInstance,
  FhevmInstanceConfig,
  HandleContractPair,
} from "../fhevmTypes";

// Re-export storage interfaces
export { GenericStringInMemoryStorage } from "../storage/GenericStringStorage";
export type { GenericStringStorage } from "../storage/GenericStringStorage";

// Re-export decryption signature (useful for advanced use cases)
export { FhevmDecryptionSignature } from "../FhevmDecryptionSignature";
