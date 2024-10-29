// boofi-lite/frontend/src/actions/use-ens-name.actions.ts

import { useName } from '@coinbase/onchainkit/identity';

interface UseEnsNameOptions {
  address: string;
  chain?: any; 
}

interface UseEnsNameResult {
  ensName: string | null;
  isLoading: boolean;
  ensNotFound: boolean;
}

/**
 * Custom hook to fetch the ENS or Base name associated with an Ethereum address.
 */
export function useEnsName({ address, chain }: UseEnsNameOptions): UseEnsNameResult {
  const { data: name, isLoading } = useName({ address: address as `0x${string}`, chain });

  const ensNotFound = !isLoading && name === null;

  return { ensName: name, isLoading, ensNotFound };
}

export default useEnsName;
