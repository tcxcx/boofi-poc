import { useName } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';
import type { UseNameOptions, UseQueryOptions } from '@coinbase/onchainkit/identity';

interface UseConditionalNameOptions {
  address?: string;
  chain?: typeof base;
}

export const useConditionalName = (
  options: UseConditionalNameOptions,
  queryOptions?: UseQueryOptions,
) => {
  const { address, chain = base } = options;
  const isValidAddress = address?.startsWith('0x') ?? false;

  return useName(
    {
      address: isValidAddress ? (address as `0x${string}`) : '0x0000000000000000000000000000000000000000',
      chain,
    },
    {
      enabled: isValidAddress,
      ...queryOptions,
    }
  );
};
