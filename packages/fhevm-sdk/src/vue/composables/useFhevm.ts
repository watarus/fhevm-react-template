/**
 * useFhevm - Vue composable for FHEVM client
 *
 * Manages FHEVM instance lifecycle in Vue applications
 */

import { ref, shallowRef, onMounted, onUnmounted, watch, type Ref, type ShallowRef } from 'vue';
import { createFhevmClient, type FhevmClient } from '../../core/client';
import type { FhevmClientConfig, FhevmClientStatus } from '../../core/types';
import type { FhevmInstance } from '../../fhevmTypes';

export interface UseFhevmResult {
  /**
   * FHEVM instance (available when status is 'ready')
   */
  instance: Ref<FhevmInstance | undefined>;

  /**
   * Current client status
   */
  status: Ref<FhevmClientStatus>;

  /**
   * Error if any
   */
  error: Ref<Error | undefined>;

  /**
   * FHEVM client (for advanced use cases)
   */
  client: ShallowRef<FhevmClient | undefined>;

  /**
   * Manually trigger reconnection
   */
  reconnect: () => Promise<void>;

  /**
   * Alias for reconnect (backward compatibility)
   */
  refresh: () => void;
}

/**
 * Vue composable for FHEVM instance management
 *
 * @param config - FHEVM client configuration (supports both old and new API)
 * @returns FHEVM instance and status
 *
 * @example
 * ```vue
 * <script setup>
 * import { useFhevm } from '@fhevm-sdk/vue';
 *
 * const { instance, status } = useFhevm({
 *   network: window.ethereum,
 *   chainId: 31337,
 * });
 * </script>
 *
 * <template>
 *   <div>Status: {{ status }}</div>
 * </template>
 * ```
 */
export function useFhevm(
  config: FhevmClientConfig | { provider?: any; initialMockChains?: any; enabled?: boolean; [key: string]: any }
): UseFhevmResult {
  const instance = ref<FhevmInstance | undefined>(undefined);
  const status = ref<FhevmClientStatus>('idle');
  const error = ref<Error | undefined>(undefined);
  const client = shallowRef<FhevmClient | undefined>(undefined);

  // Normalize config to support both old API (provider, initialMockChains) and new API (network, mockChains)
  const normalizedConfig: FhevmClientConfig = {
    network: (config as any).network || (config as any).provider,
    chainId: config.chainId,
    mockChains: (config as any).mockChains || (config as any).initialMockChains,
    debug: config.debug,
  };

  const reconnect = async () => {
    if (client.value) {
      await client.value.reconnect();
    }
  };

  // Alias for backward compatibility
  const refresh = () => {
    reconnect().catch((err) => {
      console.error('[useFhevm] Refresh failed:', err);
    });
  };

  onMounted(() => {
    // Create client
    const fhevmClient = createFhevmClient(normalizedConfig);
    client.value = fhevmClient;

    // Set up event listeners
    fhevmClient.on('statusChange', (s) => {
      status.value = s;
    });

    fhevmClient.on('ready', (inst) => {
      instance.value = inst;
      error.value = undefined;
    });

    fhevmClient.on('error', (err) => {
      error.value = err;
      instance.value = undefined;
    });

    fhevmClient.on('disconnect', () => {
      instance.value = undefined;
      error.value = undefined;
    });

    // Start connection
    fhevmClient.connect().catch((err) => {
      // Error is already handled by 'error' event
      console.error('[useFhevm] Connection failed:', err);
    });
  });

  onUnmounted(() => {
    if (client.value) {
      client.value.disconnect();
      client.value.removeAllListeners();
    }
  });

  return {
    instance,
    status,
    error,
    client,
    reconnect,
    refresh,
  };
}
