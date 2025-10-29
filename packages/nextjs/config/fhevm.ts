/**
 * FHEVM Network Configuration
 *
 * Environment variables:
 * - NEXT_PUBLIC_FHEVM_NETWORK: "hardhat" | "sepolia"
 * - NEXT_PUBLIC_CONTRACT_ADDRESS_HARDHAT: Contract address for Hardhat network
 * - NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA: Contract address for Sepolia network
 */

export type FhevmNetwork = "hardhat" | "sepolia";

const FHEVM_NETWORK = (process.env.NEXT_PUBLIC_FHEVM_NETWORK || "hardhat") as FhevmNetwork;
const CONTRACT_ADDRESS_HARDHAT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_HARDHAT || "";
const CONTRACT_ADDRESS_SEPOLIA = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || "";

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

/**
 * Get the current network configuration based on environment variable
 */
export function getFhevmNetworkConfig() {
  if (FHEVM_NETWORK === "sepolia") {
    return SEPOLIA_CONFIG;
  }
  return HARDHAT_CONFIG;
}

/**
 * Get mock chains configuration for local development
 * Only returns Hardhat config when network is set to hardhat
 */
export function getMockChains() {
  if (FHEVM_NETWORK === "hardhat") {
    return {
      [HARDHAT_CONFIG.chainId]: HARDHAT_CONFIG.rpcUrl,
    } as const;
  }
  // No mock chains for Sepolia
  return undefined;
}

/**
 * Get the current network type
 */
export function getFhevmNetwork(): FhevmNetwork {
  return FHEVM_NETWORK;
}

/**
 * Get the contract address for the current network
 * Returns undefined if the address is not set or is an empty string
 */
export function getContractAddress(): `0x${string}` | undefined {
  const config = getFhevmNetworkConfig();
  // Check for both empty string and undefined/null
  if (!config.contractAddress || config.contractAddress.trim() === "") {
    return undefined;
  }
  return config.contractAddress as `0x${string}`;
}

/**
 * Check if we're using Hardhat network
 */
export function isHardhatNetwork(): boolean {
  return FHEVM_NETWORK === "hardhat";
}

/**
 * Check if we're using Sepolia network
 */
export function isSepoliaNetwork(): boolean {
  return FHEVM_NETWORK === "sepolia";
}
