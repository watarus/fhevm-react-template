/**
 * Core encryption utilities
 * Framework-agnostic encryption helpers
 */

import type { RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";
import type { FhevmInstance } from "../fhevmTypes";
import type { EncryptionResult } from "./types";

export type RelayerEncryptedInputMethod =
  | "addBool"
  | "add8"
  | "add16"
  | "add32"
  | "add64"
  | "add128"
  | "add256"
  | "addAddress";

const DEFAULT_ENCRYPTION_METHOD: RelayerEncryptedInputMethod = "add64";

/**
 * Map external encrypted integer type to RelayerEncryptedInput builder method
 */
export function getEncryptionMethod(
  internalType: string,
): RelayerEncryptedInputMethod {
  switch (internalType) {
    case "externalEbool":
      return "addBool";
    case "externalEuint8":
      return "add8";
    case "externalEuint16":
      return "add16";
    case "externalEuint32":
      return "add32";
    case "externalEuint64":
      return "add64";
    case "externalEuint128":
      return "add128";
    case "externalEuint256":
      return "add256";
    case "externalEaddress":
      return "addAddress";
    default:
      console.warn(
        `Unknown internalType: ${internalType}, defaulting to add64`,
      );
      return DEFAULT_ENCRYPTION_METHOD;
  }
}

/**
 * Convert Uint8Array or hex-like string to 0x-prefixed hex string
 */
export function toHex(value: Uint8Array | string): `0x${string}` {
  if (typeof value === "string") {
    return (value.startsWith("0x") ? value : `0x${value}`) as `0x${string}`;
  }
  // value is Uint8Array
  return ("0x" + Buffer.from(value).toString("hex")) as `0x${string}`;
}

/**
 * Build contract params from EncryptionResult and ABI for a given function
 */
export function buildParamsFromAbi(
  enc: EncryptionResult,
  abi: any[],
  functionName: string,
): any[] {
  const fn = abi.find(
    (item: any) => item.type === "function" && item.name === functionName,
  );
  if (!fn) throw new Error(`Function ABI not found for ${functionName}`);

  return fn.inputs.map((input: any, index: number) => {
    const raw = index === 0 ? enc.handles[0] : enc.inputProof;
    switch (input.type) {
      case "bytes32":
      case "bytes":
        return toHex(raw);
      case "uint256":
        return BigInt(raw as unknown as string);
      case "address":
      case "string":
        return raw as unknown as string;
      case "bool":
        return Boolean(raw);
      default:
        console.warn(`Unknown ABI param type ${input.type}; passing as hex`);
        return toHex(raw);
    }
  });
}

/**
 * Create an encrypted input using a builder function
 *
 * @param instance - FHEVM instance
 * @param contractAddress - Target contract address
 * @param userAddress - User address
 * @param buildFn - Builder function to configure encrypted input
 * @returns Encryption result with handles and proof
 *
 * @example
 * ```typescript
 * const result = await createEncryptedInput(
 *   instance,
 *   contractAddress,
 *   userAddress,
 *   (builder) => {
 *     builder.add64(42);
 *     builder.add32(100);
 *   }
 * );
 * ```
 */
export async function createEncryptedInput(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  buildFn: (builder: RelayerEncryptedInput) => void,
): Promise<EncryptionResult> {
  const unwrap = <T>(value: T): T => {
    let current: any = value;
    while (
      current &&
      typeof current === "object" &&
      "__v_raw" in current &&
      current.__v_raw !== current
    ) {
      current = current.__v_raw;
    }
    return (current ?? value) as T;
  };

  const rawInstance = unwrap(instance) as FhevmInstance;
  const input = rawInstance.createEncryptedInput(
    contractAddress,
    userAddress,
  ) as RelayerEncryptedInput;
  const rawInput = unwrap(input);
  buildFn(rawInput);
  const enc = await rawInput.encrypt();
  return {
    handles: enc.handles,
    inputProof: enc.inputProof,
  };
}
