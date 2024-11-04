import { Chain } from "viem";
import {
  sepolia,
  optimismSepolia,
  baseSepolia,
  avalancheFuji
} from "wagmi/chains";
import { Environment, getCurrentEnvironment } from "./environment";

// The list of supported Chains for a given environment
export const SUPPORTED_CHAINS: Record<Environment, [Chain, ...Chain[]]> = {
  [Environment.localhost]: [
    baseSepolia,
    avalancheFuji
  ],
  [Environment.development]: [
    avalancheFuji,
    baseSepolia,
  ],
  [Environment.staging]: [
    avalancheFuji,
    baseSepolia,
  ],
  [Environment.production]: [
    baseSepolia,
    avalancheFuji
  ],
};

/**
 * Gets the list of supported chains for a given environment.
 * Defaults to the current environment.
 * @param env
 */
export function getChainsForEnvironment(env?: Environment) {
  if (!env) {
    env = getCurrentEnvironment();
  }
  return SUPPORTED_CHAINS[env];
}

export function getChainById(chainId: string) {
  const chains = getChainsForEnvironment();
  return chains?.find((c: Chain) => c.id === Number(chainId)) ?? null;
}
