import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { robinhood } from "viem/chains";

/**
 * Isolated wagmi config for test-driving the Holder Portal against the
 * Block Titans collection on Robinhood Chain, before the real Nasalis Flow
 * contract is wired in. This is intentionally kept separate from
 * lib/web3/config.ts (the production Nasalis Flow config) and is NEVER
 * registered as the global wagmi `Register.config`. Every hook that reads
 * this config must pass it explicitly via the `config` option, so it can
 * never leak into or replace the production wallet setup used elsewhere on
 * the site.
 */
/**
 * Robinhood Chain's public RPC (https://rpc.mainnet.chain.robinhood.com,
 * viem's default for this chain) is rate-limited and known to be
 * unreliable — Robinhood's own docs say so and point to Alchemy as the
 * recommended provider. This lets a dedicated RPC endpoint be supplied via
 * env instead, without ever hardcoding a key in source.
 *
 * NEXT_PUBLIC_* variables are inlined into the client bundle and sent as-is
 * by the browser (this config is only ever used by client-side wagmi
 * hooks), so whatever URL is placed here — including any API key it
 * contains — is visible to anyone inspecting network requests on
 * /holder-portal-test. That's an inherent tradeoff of a browser-only RPC
 * transport, not something fixable by moving the value into an env var;
 * only a server-side proxy route (a different architecture) would hide it
 * fully. If the configured provider supports it, restrict the key by HTTP
 * referrer/domain in its dashboard to limit reuse.
 */
const robinhoodTestRpcUrl = process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL;

/** True once a dedicated RPC endpoint has been configured for this test. */
export const isRobinhoodTestRpcConfigured = Boolean(robinhoodTestRpcUrl);

if (!robinhoodTestRpcUrl) {
  // Not thrown: this module also evaluates during `next build`/SSR, where a
  // hard throw would break the build. The isolated test page surfaces this
  // same message as a visible banner (see components/HolderPortalTest.tsx).
  console.error(
    "[HolderPortalTest] NEXT_PUBLIC_ROBINHOOD_RPC_URL is not set — falling back to Robinhood Chain's public " +
      "RPC (https://rpc.mainnet.chain.robinhood.com), which is rate-limited and unreliable for this test. " +
      "Set NEXT_PUBLIC_ROBINHOOD_RPC_URL in .env.local to a dedicated RPC endpoint (e.g. an Alchemy Robinhood " +
      "Chain app URL) before relying on /holder-portal-test.",
  );
}

export const testWagmiConfig = createConfig({
  chains: [robinhood],
  connectors: [injected()],
  transports: {
    // Falls back to the chain's default (public) RPC when the env var is unset — see the warning above.
    [robinhood.id]: http(robinhoodTestRpcUrl),
  },
  ssr: true,
});

/**
 * TEST-ONLY collection used to validate Holder Portal ownership detection.
 * Has no relationship to the Nasalis Flow collection/contract and must not
 * be treated as production configuration.
 */
export const BLOCK_TITANS_TEST_COLLECTION = {
  name: "Block Titans",
  chainId: robinhood.id,
  chainName: robinhood.name,
  contractAddress: "0x9FceF949F33a03e1845c20C1dd21FCdd5d7dB81a",
} as const;
