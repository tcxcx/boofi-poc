import { Base, Arbitrum, Avalanche } from "@/constants/Chains";
export const useGetChainById = (chainId: number) => {
  if (chainId === Base.chainId) return Base;
  if (chainId === Arbitrum.chainId) return Arbitrum;
  if (chainId === Avalanche.chainId) return Avalanche;
};
