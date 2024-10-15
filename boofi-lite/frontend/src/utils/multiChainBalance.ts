import { ChainEnum, TokenBalance } from "@dynamic-labs/sdk-api-core";

interface ChainBalances {
  [key: string]: {
    chainName: string;
    tokens: TokenBalance[];
    totalUSD: number;
  };
}

export const calculateChainBalances = (
  tokenBalances: TokenBalance[] | undefined
): { chainBalances: ChainBalances; totalBalanceUSD: number } => {
  if (!tokenBalances) return { chainBalances: {}, totalBalanceUSD: 0 };

  const chainBalances: ChainBalances = tokenBalances.reduce(
    (acc: ChainBalances, token) => {
      const chainKey =
        token.networkId !== undefined &&
        ChainEnum[token.networkId.toString() as keyof typeof ChainEnum]
          ? ChainEnum[token.networkId.toString() as keyof typeof ChainEnum]
          : `Chain_${token.networkId}`;

      if (!acc[chainKey]) {
        acc[chainKey] = { chainName: chainKey, tokens: [], totalUSD: 0 };
      }
      acc[chainKey].tokens.push(token);
      acc[chainKey].totalUSD += token.marketValue || 0;
      return acc;
    },
    {} as ChainBalances
  );

  const totalBalanceUSD = Object.values(chainBalances).reduce(
    (total, chain) => total + chain.totalUSD,
    0
  );

  return { chainBalances, totalBalanceUSD };
};
