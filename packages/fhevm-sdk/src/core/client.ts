/**
 * FHEVM Client - Framework-agnostic FHEVM instance manager
 */

import type { FhevmInstance } from "../fhevmTypes";
import { createFhevmInstance } from "../internal/fhevm";
import { EventEmitter } from "./EventEmitter";
import type {
  FhevmClientConfig,
  FhevmClientEvents,
  FhevmClientStatus,
  FhevmClient as IFhevmClient,
} from "./types";

/**
 * FHEVM Client implementation
 */
export class FhevmClient
  extends EventEmitter<FhevmClientEvents>
  implements IFhevmClient
{
  private _status: FhevmClientStatus = "idle";
  private _chainId: number | undefined;
  private _instance: FhevmInstance | undefined;
  private _config: Readonly<FhevmClientConfig>;
  private _abortController: AbortController | null = null;

  constructor(config: FhevmClientConfig) {
    super();
    this._config = Object.freeze({ ...config });
  }

  get status(): FhevmClientStatus {
    return this._status;
  }

  get chainId(): number | undefined {
    return this._chainId;
  }

  get instance(): FhevmInstance | undefined {
    return this._instance;
  }

  get config(): Readonly<FhevmClientConfig> {
    return this._config;
  }

  /**
   * Set status and emit event
   */
  private setStatus(status: FhevmClientStatus): void {
    if (this._status === status) return;

    this._status = status;
    this.emit("statusChange", status);

    if (this._config.debug) {
      console.log(`[FhevmClient] Status: ${status}`);
    }
  }

  /**
   * Connect and initialize FHEVM instance
   */
  async connect(): Promise<void> {
    // Already connecting or connected
    if (this._status === "connecting" || this._status === "ready") {
      return;
    }

    // Cancel any previous connection attempt
    if (this._abortController) {
      this._abortController.abort();
    }

    this._abortController = new AbortController();
    const signal = this._abortController.signal;

    try {
      this.setStatus("connecting");

      const instance = await createFhevmInstance({
        provider: this._config.network,
        mockChains: this._config.mockChains,
        signal,
        onStatusChange: (status) => {
          // Map internal status to client status
          const statusMap: Record<string, FhevmClientStatus> = {
            "sdk-loading": "sdk-loading",
            "sdk-loaded": "sdk-loading",
            "sdk-initializing": "sdk-initializing",
            "sdk-initialized": "sdk-initializing",
            creating: "creating-instance",
          };

          const clientStatus = statusMap[status];
          if (clientStatus) {
            this.setStatus(clientStatus);
          }
        },
      });

      // Check if aborted during async operation
      if (signal.aborted) {
        return;
      }

      this._instance = instance;
      this.setStatus("ready");
      this.emit("ready", instance);

      if (this._config.debug) {
        console.log("[FhevmClient] Instance ready:", instance);
      }
    } catch (error) {
      // Check if aborted
      if (signal.aborted) {
        this.setStatus("disconnected");
        return;
      }

      this.setStatus("error");
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit("error", err);

      if (this._config.debug) {
        console.error("[FhevmClient] Connection error:", err);
      }

      throw err;
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }

    this._instance = undefined;
    this._chainId = undefined;
    this.setStatus("disconnected");
    this.emit("disconnect");

    if (this._config.debug) {
      console.log("[FhevmClient] Disconnected");
    }
  }

  /**
   * Reconnect (disconnect + connect)
   */
  async reconnect(): Promise<void> {
    this.disconnect();
    await this.connect();
  }
}

/**
 * Create a new FHEVM client
 *
 * @example
 * ```typescript
 * import { createFhevmClient } from '@fhevm-sdk/core';
 *
 * const client = createFhevmClient({
 *   network: window.ethereum,
 *   chainId: 31337,
 * });
 *
 * client.on('ready', (instance) => {
 *   console.log('FHEVM ready!', instance);
 * });
 *
 * await client.connect();
 * ```
 */
export function createFhevmClient(config: FhevmClientConfig): FhevmClient {
  return new FhevmClient(config);
}
