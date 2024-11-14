import { Arbitrum, Avalanche, Base } from "@/constants/Chains";

export const useChainRpc = (chainId: number) => {
  if (chainId === Arbitrum.chainId) return Arbitrum.rpcUrls[0];
  if (chainId === Avalanche.chainId) return Avalanche.rpcUrls[0];
  if (chainId === Base.chainId) return Base.rpcUrls[0];
};
