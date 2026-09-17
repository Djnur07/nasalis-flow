"use client";

import { useWallet } from "@/lib/web3/useWallet";
import { Button } from "./Button";

function WalletIcon() {
  return (
    <svg
      viewBox="0 0 40 40"
      className="h-10 w-10 text-cream/40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <rect x="4" y="10" width="32" height="22" rx="3" />
      <path d="M4 16h32" />
      <circle cx="27" cy="23" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function HolderPreview() {
  const { isConnected, isConnecting, address, shortAddress, chainLabel, connect, disconnect, errorMessage } =
    useWallet();

  return (
    <section id="connect" className="bg-charcoal text-cream">
      <div className="mx-auto max-w-3xl px-6 py-28 text-center sm:px-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Holder Portal</p>
        <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Your Nasalis</h2>

        <div className="mt-12 flex flex-col items-center gap-6 rounded-sm border border-cream/15 px-8 py-16">
          <WalletIcon />

          {isConnected ? (
            <>
              <p className="font-mono text-sm text-cream/90" title={address}>
                {shortAddress}
              </p>
              {chainLabel && (
                <p className="text-xs uppercase tracking-[0.2em] text-cream/40">{chainLabel}</p>
              )}
              <p className="max-w-md text-cream/70">
                Wallet connected. NFT ownership verification will be available once the Nasalis
                Flow contract is deployed.
              </p>
              <button
                type="button"
                onClick={() => disconnect()}
                className="text-xs uppercase tracking-[0.2em] text-cream/60 underline-offset-4 transition-colors hover:text-cream hover:underline"
              >
                Disconnect Wallet
              </button>
            </>
          ) : (
            <>
              <p className="max-w-md text-cream/70">
                Connect your wallet to see the Nasalis Flow NFTs you own.
              </p>
              <Button
                type="button"
                tone="dark"
                variant="primary"
                onClick={connect}
                disabled={isConnecting}
                aria-busy={isConnecting}
              >
                {isConnecting ? "Connecting…" : "Connect Wallet"}
              </Button>
              {errorMessage && (
                <p role="alert" className="text-xs text-cream/60">
                  {errorMessage}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
