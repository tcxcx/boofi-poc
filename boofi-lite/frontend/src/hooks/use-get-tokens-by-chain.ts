import { AvalancheTokens, BaseTokens } from "@/constants/Tokens";

export const useGetTokensByChain = (chainId: number) => {
  if (chainId === 43113) return AvalancheTokens;
  if (chainId === 84532) return BaseTokens;
};
