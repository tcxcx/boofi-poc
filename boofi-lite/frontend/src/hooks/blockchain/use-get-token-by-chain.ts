import { Tokens } from "@/utils/tokens";

export const useGetTokenByChain = ({
  chainId,
  tokenName,
}: {
  chainId: number;
  tokenName: string;
}) => {
  return Tokens.find(
    (token) => token.name === tokenName && token.chainId === chainId
  );
};
