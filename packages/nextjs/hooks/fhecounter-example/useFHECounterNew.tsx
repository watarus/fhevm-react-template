"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDeployedContractInfo } from "../helper";
import { useWagmiEthers } from "../wagmi/useWagmiEthers";
import { useFhevm, useEncrypt, useDecrypt } from "@fhevm-sdk/react";
import { buildParamsFromAbi, getEncryptionMethod } from "@fhevm-sdk/core";
import { useInMemoryStorage } from "@fhevm-sdk";
import { ethers } from "ethers";
import type { Contract } from "~~/utils/helper/contract";
import type { AllowedChainIds } from "~~/utils/helper/networks";
import { useReadContract } from "wagmi";

/**
 * useFHECounterNew - FHE Counter hook using NEW Universal FHEVM SDK API
 *
 * Demonstrates the new Wagmi-style API:
 * - useFhevm() - Client lifecycle management with events
 * - useEncrypt() - Encryption with builder pattern
 * - useDecrypt() - Decryption with staleness detection
 *
 * Comparison with old API:
 * OLD: Manually manage instance, pass everywhere
 * NEW: Hooks manage lifecycle, automatic status tracking
 */
export const useFHECounterNew = (parameters: {
  initialMockChains?: Readonly<Record<number, string>>;
}) => {
  const { initialMockChains } = parameters;
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();

  // Wagmi + ethers interop
  const { chainId, accounts, isConnected, ethersReadonlyProvider, ethersSigner } = useWagmiEthers(initialMockChains);

  // NEW API: useFhevm() manages client lifecycle
  const { instance, status: fhevmStatus, error: fhevmError } = useFhevm({
    network: ethersReadonlyProvider || undefined,
    chainId: chainId as number | undefined,
    mockChains: initialMockChains,
  });

  // Resolve deployed contract info once we know the chain
  const allowedChainId = typeof chainId === "number" ? (chainId as AllowedChainIds) : undefined;
  const { data: fheCounter } = useDeployedContractInfo({ contractName: "FHECounter", chainId: allowedChainId });

  // Simple status string for UX messages
  const [message, setMessage] = useState<string>("");

  type FHECounterInfo = Contract<"FHECounter"> & { chainId?: number };

  const isRefreshing = false as unknown as boolean; // derived from wagmi below
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Update message when FHEVM status changes
  useEffect(() => {
    if (fhevmStatus === "connecting") setMessage("Connecting to FHEVM...");
    else if (fhevmStatus === "ready") setMessage("FHEVM ready!");
    else if (fhevmStatus === "error") setMessage(`FHEVM error: ${fhevmError?.message || "Unknown"}`);
  }, [fhevmStatus, fhevmError]);

  // -------------
  // Helpers
  // -------------
  const hasContract = Boolean(fheCounter?.address && fheCounter?.abi);
  const hasProvider = Boolean(ethersReadonlyProvider);
  const hasSigner = Boolean(ethersSigner);

  const getContract = (mode: "read" | "write") => {
    if (!hasContract) return undefined;
    const providerOrSigner = mode === "read" ? ethersReadonlyProvider : ethersSigner;
    if (!providerOrSigner) return undefined;
    return new ethers.Contract(
      fheCounter!.address,
      (fheCounter as FHECounterInfo).abi,
      providerOrSigner,
    );
  };

  // Read count handle via wagmi
  const readResult = useReadContract({
    address: (hasContract ? (fheCounter!.address as unknown as `0x${string}`) : undefined) as
      | `0x${string}`
      | undefined,
    abi: (hasContract ? ((fheCounter as FHECounterInfo).abi as any) : undefined) as any,
    functionName: "getCount" as const,
    query: {
      enabled: Boolean(hasContract && hasProvider),
      refetchOnWindowFocus: false,
    },
  });

  const countHandle = useMemo(() => (readResult.data as string | undefined) ?? undefined, [readResult.data]);
  const canGetCount = Boolean(hasContract && hasProvider && !readResult.isFetching);
  const refreshCountHandle = useCallback(async () => {
    const res = await readResult.refetch();
    if (res.error) setMessage("FHECounter.getCount() failed: " + (res.error as Error).message);
  }, [readResult]);
  // derive isRefreshing from wagmi
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _derivedIsRefreshing = readResult.isFetching;

  // NEW API: useDecrypt() with automatic signature management
  const requests = useMemo(() => {
    if (!hasContract || !countHandle || countHandle === ethers.ZeroHash) return [];
    return [{ handle: countHandle, contractAddress: fheCounter!.address }] as const;
  }, [hasContract, fheCounter?.address, countHandle]);

  const {
    canDecrypt,
    decrypt: decryptCountHandle,
    isDecrypting,
    message: decMsg,
    results,
  } = useDecrypt({
    instance,
    signer: ethersSigner as any,
    requests,
    storage: fhevmDecryptionSignatureStorage,
  });

  useEffect(() => {
    if (decMsg) setMessage(decMsg);
  }, [decMsg]);

  const clearCount = useMemo(() => {
    if (!countHandle) return undefined;
    if (countHandle === ethers.ZeroHash) return { handle: countHandle, clear: BigInt(0) } as const;
    const clear = results[countHandle];
    if (typeof clear === "undefined") return undefined;
    return { handle: countHandle, clear } as const;
  }, [countHandle, results]);

  const isDecrypted = Boolean(countHandle && clearCount?.handle === countHandle);

  // NEW API: useEncrypt() with builder pattern
  const { encrypt, canEncrypt } = useEncrypt({
    instance,
    signer: ethersSigner as any,
    contractAddress: fheCounter?.address || "",
  });

  const canUpdateCounter = useMemo(
    () => Boolean(hasContract && canEncrypt && !isProcessing),
    [hasContract, canEncrypt, isProcessing],
  );

  const getEncryptionMethodFor = (functionName: "increment" | "decrement") => {
    const functionAbi = fheCounter?.abi.find(item => item.type === "function" && item.name === functionName);
    if (!functionAbi) return { method: undefined as string | undefined, error: `Function ABI not found for ${functionName}` } as const;
    if (!functionAbi.inputs || functionAbi.inputs.length === 0)
      return { method: undefined as string | undefined, error: `No inputs found for ${functionName}` } as const;
    const firstInput = functionAbi.inputs[0]!;
    return { method: getEncryptionMethod(firstInput.internalType), error: undefined } as const;
  };

  const updateCounter = useCallback(
    async (value: number) => {
      if (isProcessing || !canUpdateCounter || value === 0) return;
      const op = value > 0 ? "increment" : "decrement";
      const valueAbs = Math.abs(value);
      setIsProcessing(true);
      setMessage(`Starting ${op}(${valueAbs})...`);
      try {
        const { method, error } = getEncryptionMethodFor(op);
        if (!method) return setMessage(error ?? "Encryption method not found");

        setMessage(`Encrypting with ${method}...`);
        // NEW API: Builder pattern for encryption
        const enc = await encrypt((builder) => {
          (builder as any)[method](valueAbs);
        });
        if (!enc) return setMessage("Encryption failed");

        const writeContract = getContract("write");
        if (!writeContract) return setMessage("Contract info or signer not available");

        const params = buildParamsFromAbi(enc, [...fheCounter!.abi] as any[], op);
        const tx = await (op === "increment" ? writeContract.increment(...params) : writeContract.decrement(...params));
        setMessage("Waiting for transaction...");
        await tx.wait();
        setMessage(`${op}(${valueAbs}) completed!`);
        refreshCountHandle();
      } catch (e) {
        setMessage(`${op} failed: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, canUpdateCounter, encrypt, getContract, refreshCountHandle, fheCounter?.abi],
  );

  return {
    contractAddress: fheCounter?.address,
    canDecrypt,
    canGetCount,
    canUpdateCounter,
    updateCounter,
    decryptCountHandle,
    refreshCountHandle,
    isDecrypted,
    message,
    clear: clearCount?.clear,
    handle: countHandle,
    isDecrypting,
    isRefreshing,
    isProcessing,
    // Wagmi-specific values
    chainId,
    accounts,
    isConnected,
    ethersSigner,
    // NEW API status
    fhevmStatus,
    fhevmError,
  };
};
