import { Arbitrum, Avalanche, Base } from "@/constants/Chains";
import { AvalancheTokens, BaseTokens } from "@/constants/Tokens";

export const useGetTokenOrChainById = (
  chainId: number,
  type: "token" | "chain"
) => {
  if (type === "token") {
    if (chainId === 43113) return AvalancheTokens;
    if (chainId === 84532) return BaseTokens;
    return BaseTokens;
  }
  if (type === "chain") {
    return chainId === 43113
      ? Avalanche.chainId
      : chainId === 84532
      ? Base.chainId
      : chainId === Arbitrum.chainId
      ? Arbitrum.chainId
      : undefined;
  }
};
