"use client";

import { useState } from "react";
import { useConnect } from "wagmi";

import { useWallet } from "@/lib/web3/useWallet";
import { Button } from "./Button";

type WalletButtonProps = {
  tone?: "light" | "dark";
  variant?: "primary" | "outline";
  className?: string;
  fullWidth?: boolean;
};

export function WalletButton({
  tone = "light",
  variant = "primary",
  className = "",
  fullWidth = false,
}: WalletButtonProps) {
  const {
    isConnected,
    isConnecting,
    shortAddress,
    disconnect,
    errorMessage,
  } = useWallet();

  const { connectors, connect, isPending } = useConnect();
  const [isOpen, setIsOpen] = useState(false);

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
            tone === "dark"
              ? "text-bone/75 hover:text-bone"
              : "text-bone/65 hover:text-bone"
          }`}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`inline-flex flex-col items-start ${fullWidth ? "w-full" : ""}`}>
        <Button
          type="button"
          tone={tone}
          variant={variant}
          className={`${fullWidth ? "w-full" : ""} ${className}`}
          onClick={() => setIsOpen(true)}
          disabled={isConnecting}
          aria-busy={isConnecting}
        >
          {isConnecting ? "Connecting…" : "Connect Wallet"}
        </Button>

        {errorMessage && (
          <p
            role="alert"
            className={`mt-2 text-xs ${
              tone === "dark" ? "text-bone/80" : "text-bone/70"
            }`}
          >
            {errorMessage}
          </p>
        )}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Choose wallet"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-sm border border-bone/15 bg-[#11110f] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-bone/50">
                  Wallet
                </p>
                <h2 className="mt-2 text-xl text-bone">
                  Choose your wallet
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-bone/50 hover:text-bone"
                aria-label="Close wallet selection"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {connectors.filter((connector) => connector.id !== "injected").map((connector) => (
                <button
                  key={connector.uid}
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    connect({ connector });
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between border border-bone/10 px-4 py-4 text-left text-sm text-bone transition hover:border-bone/30 hover:bg-bone/5 disabled:opacity-50"
                >
                  <span>{connector.name}</span>
                  <span className="text-xs text-bone/40">
                    Connect
                  </span>
                </button>
              ))}
            </div>

            {connectors.length === 0 && (
              <p className="text-sm leading-6 text-bone/60">
                No compatible wallet was detected in this browser.
              </p>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-5 w-full py-3 text-xs uppercase tracking-[0.15em] text-bone/50 hover:text-bone"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
