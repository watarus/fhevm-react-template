/**
 * FHEVM Network Configuration for Nuxt
 */

export type FhevmNetwork = "hardhat" | "sepolia";

// Read from environment variables (available at build time and runtime)
const FHEVM_NETWORK = (process.env.NUXT_PUBLIC_FHEVM_NETWORK ||
  "hardhat") as FhevmNetwork;
const CONTRACT_ADDRESS_HARDHAT =
  process.env.NUXT_PUBLIC_CONTRACT_ADDRESS_HARDHAT || "";
const CONTRACT_ADDRESS_SEPOLIA =
  process.env.NUXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || "";

// Hardhat network configuration
export const HARDHAT_CONFIG = {
  chainId: 31337,
  rpcUrl: "http://localhost:8545",
  contractAddress: CONTRACT_ADDRESS_HARDHAT,
} as const;

// Sepolia network configuration
export const SEPOLIA_CONFIG = {
  chainId: 11155111,
  rpcUrl: "https://sepolia.drpc.org",
  contractAddress: CONTRACT_ADDRESS_SEPOLIA,
} as const;

export function getFhevmNetworkConfig() {
  if (FHEVM_NETWORK === "sepolia") {
    return SEPOLIA_CONFIG;
  }
  return HARDHAT_CONFIG;
}

export function getMockChains() {
  if (FHEVM_NETWORK === "hardhat") {
    return {
      [HARDHAT_CONFIG.chainId]: HARDHAT_CONFIG.rpcUrl,
    } as const;
  }
  return undefined;
}

export function getFhevmNetwork(): FhevmNetwork {
  return FHEVM_NETWORK;
}

export function getContractAddress(): `0x${string}` | undefined {
  const config = getFhevmNetworkConfig();
  // Check for both empty string and undefined/null
  if (!config.contractAddress || config.contractAddress.trim() === "") {
    return undefined;
  }
  return config.contractAddress as `0x${string}`;
}

export function isHardhatNetwork(): boolean {
  return FHEVM_NETWORK === "hardhat";
}

export function isSepoliaNetwork(): boolean {
  return FHEVM_NETWORK === "sepolia";
}
