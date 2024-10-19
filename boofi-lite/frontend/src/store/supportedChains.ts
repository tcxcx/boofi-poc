import { Chain } from "viem";
import {
  mainnet,
  sepolia,
  optimism,
  optimismSepolia,
  celo,
  celoAlfajores,
  base,
  baseSepolia,
  mode,
  modeTestnet,
} from "wagmi/chains";
import { Environment, getCurrentEnvironment } from "./environment";

// The list of supported Chains for a given environment
export const SUPPORTED_CHAINS: Record<Environment, [Chain, ...Chain[]]> = {
  [Environment.localhost]: [
    mainnet,
    sepolia,
    optimism,
    optimismSepolia,
    celo,
    celoAlfajores,
    base,
    baseSepolia,
    mode,
    modeTestnet,
  ],
  [Environment.development]: [
    mainnet,
    sepolia,
    optimism,
    optimismSepolia,
    celo,
    celoAlfajores,
    base,
    baseSepolia,
    mode,
    modeTestnet,
  ],
  [Environment.staging]: [
    mainnet,
    sepolia,
    optimism,
    optimismSepolia,
    celo,
    celoAlfajores,
    base,
    baseSepolia,
    mode,
    modeTestnet,
  ],
  [Environment.production]: [
    mainnet,
    sepolia,
    optimism,
    optimismSepolia,
    celo,
    celoAlfajores,
    base,
    baseSepolia,
    mode,
    modeTestnet,
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
