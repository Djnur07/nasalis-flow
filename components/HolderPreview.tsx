"use client";

import { useWallet } from "@/lib/web3/useWallet";
import { Button } from "./Button";

function WalletIcon() {
  return (
    <svg
      viewBox="0 0 40 40"
      className="h-9 w-9 text-bone/55"
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

// A compact gallery-style information panel — designed to sit beside the
// featured artwork in the Hero, not as a standalone dashboard section.
export function HolderPreview() {
  const { isConnected, isConnecting, address, shortAddress, chainLabel, connect, disconnect, errorMessage } =
    useWallet();

  return (
    <div className="flex h-full flex-col justify-center gap-8 border border-bone/15 bg-noir-soft px-8 py-12 sm:px-10 lg:px-6 xl:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-turquoise">Holder Portal</p>
        <h2 className="mt-3 font-serif text-3xl text-bone">Your Nasalis</h2>
      </div>

      <WalletIcon />

      {isConnected ? (
        <div className="flex flex-col items-start gap-3">
          <p className="font-mono text-sm text-bone/90" title={address}>
            {shortAddress}
          </p>
          {chainLabel && <p className="text-xs uppercase tracking-[0.2em] text-bone/55">{chainLabel}</p>}
          <p className="text-sm leading-relaxed text-bone/78">
            Wallet connected. NFT ownership verification will be available once the Nasalis Flow
            contract is deployed.
          </p>
          <button
            type="button"
            onClick={() => disconnect()}
            className="text-xs uppercase tracking-[0.2em] text-bone/70 underline-offset-4 transition-colors hover:text-bone hover:underline"
          >
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-4">
          <p className="text-sm leading-relaxed text-bone/78">
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
            <p role="alert" className="text-xs text-bone/70">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
