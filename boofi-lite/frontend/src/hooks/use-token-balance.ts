import { useState, useEffect } from 'react';
import {
  Address,
  formatUnits,
  createPublicClient,
  http,
  Chain,
  erc20Abi,
} from 'viem';
import { UseTokenBalanceProps } from '@/lib/types';
import { avalancheFuji, baseSepolia } from 'wagmi/chains';

export const useTokenBalance = ({
  tokenAddress,
  chainId,
  accountAddress,
  decimals,
}: UseTokenBalanceProps) => {
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!tokenAddress || !accountAddress || !chainId) return;

      let chain: Chain | undefined;

      if (chainId === avalancheFuji.id) {
        chain = avalancheFuji;
      } else if (chainId === baseSepolia.id) {
        chain = baseSepolia;
      } else {
        console.error('Unsupported chainId:', chainId);
        return;
      }

      const rpcUrl = chain.rpcUrls.default.http[0];

      const client = createPublicClient({
        chain,
        transport: http(rpcUrl),
      });

      try {
        setIsLoading(true);

        console.log('Fetching balance with the following parameters:');
        console.log('Token Address:', tokenAddress);
        console.log('Chain ID:', chainId);
        console.log('Account Address:', accountAddress);

        const rawBalance: bigint = await client.readContract({
          address: tokenAddress as Address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [accountAddress as Address],
        });
        const formattedBalance = formatUnits(rawBalance, decimals);
        setBalance(formattedBalance);
      } catch (error) {
        console.error('Error fetching token balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [tokenAddress, accountAddress, decimals, chainId]);

  return { balance, isLoading };
};
