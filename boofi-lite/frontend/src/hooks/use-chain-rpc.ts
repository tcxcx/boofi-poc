import { Arbitrum, Avalanche, Base } from "@/constants/Chains";

export const useChainRpc = (chainId: number) => {
  if (chainId === Arbitrum.id) return Arbitrum.rpcUrls.default.http[0];
  if (chainId === Avalanche.id) return Avalanche.rpcUrls.default.http[0];
  if (chainId === Base.id) return Base.rpcUrls.default.http[0];
};
