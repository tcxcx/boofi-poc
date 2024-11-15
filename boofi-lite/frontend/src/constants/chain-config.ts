
import * as Chains from "@/constants/Chains";

export const getChainConfig = (chainId: number | null) => {
    if (!chainId) return null;
    const chains = {
      [Chains.Base.chainId]: Chains.Base,
      [Chains.Avalanche.chainId]: Chains.Avalanche,
      [Chains.Arbitrum.chainId]: Chains.Arbitrum,
    };
    return chains[chainId] || null;
  };