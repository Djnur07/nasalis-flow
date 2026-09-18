"use client";

import { useWallet } from "@/lib/web3/useWallet";
import { Button } from "./Button";

type WalletButtonProps = {
  tone?: "light" | "dark";
  variant?: "primary" | "outline";
  className?: string;
  fullWidth?: boolean;
};

export function WalletButton({ tone = "light", variant = "primary", className = "", fullWidth = false }: WalletButtonProps) {
  const { isConnected, isConnecting, shortAddress, connect, disconnect, errorMessage } = useWallet();

  if (isConnected) {
    return (
      <div className={`inline-flex items-center gap-3 ${fullWidth ? "w-full" : ""}`}>
        <span
          title="Connected wallet address"
          className={`px-5 py-3 text-xs font-medium tracking-[0.15em] ${
            tone === "dark" ? "bg-bone/10 text-bone" : "bg-bone/5 text-bone"
          } ${fullWidth ? "flex-1 text-center" : ""}`}
        >
          {shortAddress}
        </span>
        <button
          type="button"
          onClick={() => disconnect()}
          aria-label="Disconnect wallet"
          className={`text-xs uppercase tracking-[0.15em] underline-offset-4 hover:underline ${
            tone === "dark" ? "text-bone/75 hover:text-bone" : "text-bone/65 hover:text-bone"
          }`}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start ${fullWidth ? "w-full" : ""}`}>
      <Button
        type="button"
        tone={tone}
        variant={variant}
        className={`${fullWidth ? "w-full" : ""} ${className}`}
        onClick={connect}
        disabled={isConnecting}
        aria-busy={isConnecting}
      >
        {isConnecting ? "Connecting…" : "Connect Wallet"}
      </Button>
      {errorMessage && (
        <p role="alert" className={`mt-2 text-xs ${tone === "dark" ? "text-bone/80" : "text-bone/70"}`}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
