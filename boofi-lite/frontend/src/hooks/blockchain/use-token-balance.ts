import { useTokenBalances } from "@dynamic-labs/sdk-react-core";
import { formatUnits } from "viem";
import { UseTokenBalanceProps } from "@/lib/types";

export function useTokenBalance({
  tokenAddress,
  chainId,
  address,
  setBalance: externalSetBalance,
}: UseTokenBalanceProps) {
  const { tokenBalances, isLoading, isError } = useTokenBalances({
    accountAddress: address,
    tokenAddresses: [tokenAddress],
    networkId: chainId,
  });

  const balance = tokenBalances?.[0]?.balance || '0';
  const decimals = tokenBalances?.[0]?.decimals || 18;
  const formattedBalance = formatUnits(BigInt(balance), decimals);

  if (externalSetBalance) {
    externalSetBalance(formattedBalance);
  }

  return {
    balance: formattedBalance,
    isLoading,
    error: isError,
    refetch: null
  };
}