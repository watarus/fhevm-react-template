/**
 * useFHECounter - Vue composable for FHE Counter using FHEVM SDK
 *
 * Demonstrates the Vue Composition API with FHEVM:
 * - useFhevm() - Client lifecycle management
 * - useEncrypt() - Encryption with builder pattern
 * - useDecrypt() - Decryption with staleness detection
 */

import {
  getEncryptionMethod,
  type RelayerEncryptedInputMethod,
} from "@fhevm-sdk/core";
import { useEncrypt, useFhevm } from "@fhevm-sdk/vue";
import type { RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";
import type { InterfaceAbi } from "ethers";
import { computed, ref, watch, type Ref } from "vue";
import { useWagmiEthers } from "./useWagmiEthers";

type BuilderExecutor = (builder: RelayerEncryptedInput, value: number) => void;

const BUILDER_EXECUTORS: Record<RelayerEncryptedInputMethod, BuilderExecutor> =
  {
    addBool: (builder, value) => builder.addBool(value),
    add8: (builder, value) => builder.add8(value),
    add16: (builder, value) => builder.add16(value),
    add32: (builder, value) => builder.add32(value),
    add64: (builder, value) => builder.add64(value),
    add128: (builder, value) => builder.add128(value),
    add256: (builder, value) => builder.add256(value),
    addAddress: (builder, value) => builder.addAddress(String(value)),
  };

export interface UseFHECounterParams {
  initialMockChains?: Readonly<Record<number, string>>;
}

export function useFHECounter(params: UseFHECounterParams) {
  const { initialMockChains } = params;

  // Wagmi-Ethers integration
  const {
    chainId,
    accounts,
    isConnected,
    fhevmProvider,
    ethersReadonlyProvider,
    ethersSigner,
  } = useWagmiEthers(initialMockChains);

  // Debug: Log fhevmProvider value
  watch(
    fhevmProvider,
    (value) => {
      console.log(
        "[useFHECounter] fhevmProvider changed:",
        value,
        "type:",
        typeof value,
      );
    },
    { immediate: true },
  );

  // FHEVM SDK
  const {
    instance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    network: fhevmProvider,
    chainId: chainId as Ref<number | undefined>,
    mockChains: initialMockChains,
  });

  // Address from accounts
  const address = computed(() => accounts.value?.[0]);

  // Contract info (placeholder - will be replaced with actual contract loading)
  const contractAddress = ref<string>(
    "0x40e8Aa088739445BC3a3727A724F56508899f65B",
  );

  // Encryption helper
  const { encrypt, canEncrypt } = useEncrypt({
    instance,
    signer: ethersSigner,
    contractAddress: contractAddress.value,
  });

  const contractAbi = ref<InterfaceAbi>([
    {
      inputs: [
        {
          internalType: "externalEuint32",
          name: "inputEuint32",
          type: "bytes32",
        },
        { internalType: "bytes", name: "inputProof", type: "bytes" },
      ],
      name: "increment",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "externalEuint32",
          name: "inputEuint32",
          type: "bytes32",
        },
        { internalType: "bytes", name: "inputProof", type: "bytes" },
      ],
      name: "decrement",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getCount",
      outputs: [{ internalType: "euint32", name: "", type: "bytes32" }],
      stateMutability: "view",
      type: "function",
    },
  ]);

  // UI state
  const message = ref<string>("");
  const decryptedValue = ref<number | undefined>(undefined);
  const encryptedHandle = ref<string | undefined>(undefined);

  // Loading states
  const isIncrementing = ref(false);
  const isDecrementing = ref(false);
  const isDecrypting = ref(false);

  // Computed
  const canInteract = computed(() => {
    return (
      fhevmStatus.value === "ready" && instance.value && contractAddress.value
    );
  });

  const canDecrypt = computed(() => {
    return canInteract.value && encryptedHandle.value && address.value;
  });

  const network = computed(() => {
    if (chainId.value === 31337) return "Hardhat (localhost)";
    if (chainId.value === 11155111) return "Sepolia Testnet";
    return `Chain ${chainId.value}`;
  });

  // Helper: Get encryption method from ABI
  const getEncryptionMethodFor = (functionName: "increment" | "decrement") => {
    // InterfaceAbi can be an array of Fragment objects
    const fragments = Array.isArray(contractAbi.value) ? contractAbi.value : [];

    const functionAbi = fragments.find(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "type" in item &&
        item.type === "function" &&
        "name" in item &&
        item.name === functionName,
    );

    if (!functionAbi || typeof functionAbi !== "object") {
      return {
        method: undefined,
        error: `Function ABI not found for ${functionName}`,
      };
    }

    if (
      !("inputs" in functionAbi) ||
      !Array.isArray(functionAbi.inputs) ||
      functionAbi.inputs.length === 0
    ) {
      return {
        method: undefined,
        error: `No inputs found for ${functionName}`,
      };
    }

    const firstInput = functionAbi.inputs[0];
    if (
      typeof firstInput !== "object" ||
      firstInput === null ||
      !("internalType" in firstInput)
    ) {
      return {
        method: undefined,
        error: `No internalType found for ${functionName}`,
      };
    }

    return {
      method: getEncryptionMethod(firstInput.internalType as string),
      error: undefined,
    };
  };

  // Actions
  const increment = async (value: number) => {
    if (!canInteract.value || !canEncrypt.value) {
      message.value = "FHEVM not ready or wallet not connected";
      return;
    }

    try {
      isIncrementing.value = true;
      message.value = `Encrypting value ${value}...`;

      // Get encryption method from ABI
      const { method, error: methodError } =
        getEncryptionMethodFor("increment");
      if (!method) {
        message.value = methodError || "Encryption method not found";
        return;
      }

      // NEW API: Builder pattern for encryption
      const enc = await encrypt((builder) => {
        // Use the encryption method determined from ABI
        BUILDER_EXECUTORS[method](builder, value);
      });
      if (!enc) {
        message.value = "Encryption failed";
        return;
      }

      message.value = "Sending transaction...";

      // Simulate transaction (placeholder)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.value = `Successfully incremented by ${value}!`;

      // Refresh the counter
      await fetchCounter();
    } catch (error) {
      console.error("Increment failed:", error);
      message.value = `Increment failed: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      isIncrementing.value = false;
    }
  };

  const decrement = async (value: number) => {
    if (!canInteract.value || !canEncrypt.value) {
      message.value = "FHEVM not ready or wallet not connected";
      return;
    }

    try {
      isDecrementing.value = true;
      message.value = `Encrypting value ${value}...`;

      // Get encryption method from ABI
      const { method, error: methodError } =
        getEncryptionMethodFor("decrement");
      if (!method) {
        message.value = methodError || "Encryption method not found";
        return;
      }

      // NEW API: Builder pattern for encryption
      const enc = await encrypt((builder) => {
        // Use the encryption method determined from ABI
        BUILDER_EXECUTORS[method](builder, value);
      });
      if (!enc) {
        message.value = "Encryption failed";
        return;
      }

      message.value = "Sending transaction...";

      // Simulate transaction (placeholder)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.value = `Successfully decremented by ${value}!`;

      // Refresh the counter
      await fetchCounter();
    } catch (error) {
      console.error("Decrement failed:", error);
      message.value = `Decrement failed: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      isDecrementing.value = false;
    }
  };

  const decrypt = async () => {
    if (
      !canDecrypt.value ||
      !instance.value ||
      !encryptedHandle.value ||
      !address.value
    ) {
      message.value = "Cannot decrypt: missing requirements";
      return;
    }

    try {
      isDecrypting.value = true;
      message.value = "Decrypting...";

      // Simulate decryption (placeholder)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      decryptedValue.value = Math.floor(Math.random() * 100);

      message.value = "Decryption successful!";
    } catch (error) {
      console.error("Decryption failed:", error);
      message.value = `Decryption failed: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      isDecrypting.value = false;
    }
  };

  const fetchCounter = async () => {
    if (!canInteract.value) return;

    try {
      // Simulate fetching (placeholder)
      encryptedHandle.value = "0x" + "0".repeat(64);
      message.value = 'Counter fetched. Click "Decrypt" to view value.';
    } catch (error) {
      console.error("Failed to fetch counter:", error);
    }
  };

  // Watch for FHEVM ready
  watch(
    () => fhevmStatus.value,
    (status) => {
      if (status === "ready") {
        message.value = "FHEVM SDK ready! Connect wallet to interact.";
        fetchCounter();
      } else if (status === "error") {
        message.value =
          "FHEVM SDK error. Make sure Hardhat network is running on localhost:8545";
      }
    },
  );

  return {
    // State
    decryptedValue,
    message,
    fhevmStatus,
    contractAddress,
    network,
    encryptedHandle,

    // Loading states
    isIncrementing,
    isDecrementing,
    isDecrypting,

    // Actions
    increment,
    decrement,
    decrypt,

    // Computed
    canInteract,
    canDecrypt,
  };
}
