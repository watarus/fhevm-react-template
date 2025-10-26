/**
 * @fhevm-sdk
 *
 * Universal FHEVM SDK - Framework-agnostic toolkit for building confidential dApps
 *
 * ## Usage
 *
 * ### For React applications:
 * ```typescript
 * import { useFhevm, useEncrypt, useDecrypt } from '@fhevm-sdk/react';
 * // or
 * import { useFhevm } from '@fhevm-sdk';
 * ```
 *
 * ### For framework-agnostic or Node.js:
 * ```typescript
 * import { createFhevmClient } from '@fhevm-sdk/core';
 * // or
 * import { createFhevmClient } from '@fhevm-sdk';
 * ```
 */

// Core - Framework-agnostic FHEVM client and utilities
export * from "./core/index";

// React - React hooks and components
export * from "./react/index";

// Storage - Storage utilities
export * from "./storage/index";

// Types - Common types
export * from "./fhevmTypes";

// Decryption signature (for advanced use cases)
export * from "./FhevmDecryptionSignature";

