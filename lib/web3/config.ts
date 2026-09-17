import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { arbitrum, base, mainnet, optimism, polygon } from "wagmi/chains";

/**
 * The Nasalis Flow contract is not deployed yet, so this config makes no
 * assumption about which network it will eventually live on. These chains
 * exist only so a connected wallet's current network can be resolved to a
 * friendly name for display — once the contract is deployed, this is the
 * single place to scope the app to its actual network.
 */
export const wagmiConfig = createConfig({
  chains: [mainnet, base, arbitrum, optimism, polygon],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

export function getChainLabel(chainId: number): string {
  const chain = wagmiConfig.chains.find((candidate) => candidate.id === chainId);
  return chain?.name ?? `Chain ${chainId}`;
}
