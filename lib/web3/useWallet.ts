"use client";

import { useMemo } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { getChainLabel } from "./config";
import { getWalletErrorMessage } from "./errors";

function shorten(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Read-only wallet connection state shared across the site. Wraps wagmi so
 * account/network changes and already-authorized reconnects are handled by
 * the library rather than hand-rolled provider listeners. Never requests a
 * signature or transaction — only the connector's account/chain info.
 */
export function useWallet() {
  const { address, isConnected, chainId, status } = useAccount();
  const { connect, connectors, error, isPending, reset } = useConnect();
  const { disconnect } = useDisconnect();

  const shortAddress = useMemo(() => (address ? shorten(address) : undefined), [address]);
  const chainLabel = useMemo(() => (chainId ? getChainLabel(chainId) : undefined), [chainId]);
  const errorMessage = useMemo(() => (error ? getWalletErrorMessage(error) : undefined), [error]);

  const connectWallet = () => {
    const connector = connectors[0];
    if (!connector) return;
    reset();
    connect({ connector });
  };

  return {
    address,
    shortAddress,
    chainLabel,
    isConnected,
    isConnecting: isPending || status === "connecting" || status === "reconnecting",
    connect: connectWallet,
    disconnect,
    errorMessage,
  };
}
