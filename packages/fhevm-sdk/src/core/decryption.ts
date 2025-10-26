/**
 * Core decryption utilities
 * Framework-agnostic decryption helpers
 */

import type { FhevmInstance, HandleContractPair } from "../fhevmTypes";
import type { DecryptionRequest, DecryptionResults } from "./types";
import { FhevmDecryptionSignature } from "../FhevmDecryptionSignature";
import type { GenericStringStorage } from "../storage/GenericStringStorage";
import type { ethers } from "ethers";

/**
 * Decrypt FHE-encrypted values from smart contracts
 *
 * @param instance - FHEVM instance
 * @param requests - Array of decryption requests (handle + contract address)
 * @param signer - Ethers signer for EIP-712 signature
 * @param storage - Storage for decryption signature caching
 * @returns Record of handle -> decrypted bigint value
 *
 * @example
 * ```typescript
 * const results = await decrypt(instance, [
 *   { handle: '0x123...', contractAddress: '0xabc...' }
 * ], signer, storage);
 *
 * console.log(results['0x123...']); // bigint value
 * ```
 */
export async function decrypt(
  instance: FhevmInstance,
  requests: readonly DecryptionRequest[],
  signer: ethers.JsonRpcSigner,
  storage: GenericStringStorage
): Promise<DecryptionResults> {
  if (!instance || !signer || requests.length === 0) {
    return {};
  }

  // Extract unique contract addresses
  const contractAddresses = Array.from(
    new Set(requests.map(r => r.contractAddress))
  );

  // Get or create decryption signature (EIP-712)
  const signature = await FhevmDecryptionSignature.loadOrSign(
    instance,
    contractAddresses,
    signer,
    storage
  );

  if (!signature) {
    throw new Error("Failed to create decryption signature");
  }

  // Prepare requests for userDecrypt
  const handleContractPairs: HandleContractPair[] = requests.map(r => ({
    handle: r.handle,
    contractAddress: r.contractAddress,
  }));

  // Decrypt using FHEVM instance
  const decrypted = await instance.userDecrypt(
    handleContractPairs,
    signature.privateKey,
    signature.publicKey,
    signature.signature,
    signature.contractAddresses,
    signature.userAddress,
    signature.startTimestamp,
    signature.durationDays
  );

  return decrypted as DecryptionResults;
}

/**
 * Check if a decryption signature exists and is valid
 *
 * @param instance - FHEVM instance
 * @param contractAddresses - Contract addresses for the signature
 * @param userAddress - User address
 * @param storage - Storage for signature
 * @returns true if valid signature exists
 */
export async function hasValidSignature(
  instance: FhevmInstance,
  contractAddresses: string[],
  userAddress: string,
  storage: GenericStringStorage
): Promise<boolean> {
  try {
    const signature = await FhevmDecryptionSignature.loadFromGenericStringStorage(
      storage,
      instance,
      contractAddresses,
      userAddress
    );

    return signature !== null && signature.isValid();
  } catch {
    return false;
  }
}
