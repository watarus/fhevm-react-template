/**
 * Core type definitions for FHEVM SDK
 * Framework-agnostic types for the FHEVM client
 */

import type { Eip1193Provider } from "ethers";
import type { FhevmInstance } from "../fhevmTypes";

/**
 * WalletClient type (Wagmi-compatible)
 * Any object with a request method is considered EIP-1193 compatible
 */
export type WalletClient = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  chain?: { id: number };
};

/**
 * FHEVM Client configuration
 */
export interface FhevmClientConfig {
  /**
   * Network provider (EIP-1193 provider, WalletClient, RPC URL, or undefined)
   * - Eip1193Provider: Standard EIP-1193 provider (e.g., MetaMask)
   * - WalletClient: Wagmi WalletClient (zero-config support!)
   * - string: RPC URL (e.g., "http://localhost:8545")
   * - undefined: Use fallbackRpc when wallet not connected
   */
  network?: Eip1193Provider | WalletClient | string;

  /**
   * Fallback RPC URL when network is undefined (e.g., wallet not connected)
   * Enables FHEVM initialization before wallet connection
   * @example "http://localhost:8545"
   * @example "https://sepolia.drpc.org"
   */
  fallbackRpc?: string;

  /**
   * Chain ID (optional, will be auto-detected if not provided)
   */
  chainId?: number;

  /**
   * Mock chains configuration for local development
   * Key: chainId, Value: RPC URL
   * @default { 31337: "http://localhost:8545" }
   */
  mockChains?: Record<number, string>;

  /**
   * Storage adapter for public keys (optional)
   * If not provided, uses IndexedDB in browser, memory in Node.js
   */
  storage?: StorageAdapter;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
}

/**
 * Storage adapter interface for public keys
 */
export interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/**
 * FHEVM Client status
 */
export type FhevmClientStatus =
  | "idle"
  | "connecting"
  | "sdk-loading"
  | "sdk-initializing"
  | "creating-instance"
  | "ready"
  | "error"
  | "disconnected";

/**
 * FHEVM Client events
 */
export interface FhevmClientEvents extends Record<string, (...args: any[]) => void> {
  /**
   * Emitted when client status changes
   */
  statusChange: (status: FhevmClientStatus) => void;

  /**
   * Emitted when FHEVM instance is ready
   */
  ready: (instance: FhevmInstance) => void;

  /**
   * Emitted when an error occurs
   */
  error: (error: Error) => void;

  /**
   * Emitted when client disconnects
   */
  disconnect: () => void;
}

/**
 * Event emitter interface
 */
export interface EventEmitter<Events extends Record<string, (...args: any[]) => void> = Record<string, (...args: any[]) => void>> {
  on<K extends keyof Events>(event: K, listener: Events[K]): void;
  off<K extends keyof Events>(event: K, listener: Events[K]): void;
  emit<K extends keyof Events>(event: K, ...args: any[]): void;
}

/**
 * FHEVM Client interface
 */
export interface FhevmClient extends EventEmitter<FhevmClientEvents> {
  /**
   * Current client status
   */
  readonly status: FhevmClientStatus;

  /**
   * Current chain ID
   */
  readonly chainId: number | undefined;

  /**
   * FHEVM instance (available when status is 'ready')
   */
  readonly instance: FhevmInstance | undefined;

  /**
   * Configuration
   */
  readonly config: Readonly<FhevmClientConfig>;

  /**
   * Connect and initialize FHEVM instance
   */
  connect(): Promise<void>;

  /**
   * Disconnect and cleanup
   */
  disconnect(): void;

  /**
   * Reconnect (disconnect + connect)
   */
  reconnect(): Promise<void>;
}

/**
 * Encryption result from encrypted input builder
 */
export interface EncryptionResult {
  handles: Uint8Array[];
  inputProof: Uint8Array;
}

/**
 * Decryption request
 */
export interface DecryptionRequest {
  handle: string;
  contractAddress: string;
}

/**
 * Decryption result
 */
export type DecryptionResults = Record<string, bigint>;

/**
 * Encryption parameters
 */
export interface EncryptionParams {
  instance: FhevmInstance | undefined;
  contractAddress: string;
  userAddress: string;
}

/**
 * Decryption parameters
 */
export interface DecryptionParams {
  instance: FhevmInstance | undefined;
  requests: readonly DecryptionRequest[];
  signer: any; // ethers.JsonRpcSigner
  storage: any; // GenericStringStorage
  chainId: number | undefined;
}
