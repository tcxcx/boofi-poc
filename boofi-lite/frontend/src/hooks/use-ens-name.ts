// boofi-lite/frontend/src/actions/use-ens-name.actions.ts
import { useEnsName as useEnsNameWagmi } from "wagmi";
import { useName } from "@coinbase/onchainkit/identity";
import { truncateAddress } from "@/utils/truncateAddress";
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
export function useEnsName({
  address,
  chain,
}: UseEnsNameOptions): UseEnsNameResult {
  let ensName: string | null = null;
  const result = useEnsNameWagmi({
    address: address as `0x${string}`,
    chainId: chain.id,
  });
  const { data: name, isLoading } = useName({
    address: address as `0x${string}`,
    chain,
  });

  const ensNotFound = !isLoading && name === null;

  if (result.data) {
    ensName = result.data;
  } else if (name) {
    ensName = name;
  } else {
    ensName = truncateAddress(address);
  }

  return { ensName, isLoading, ensNotFound };
}

export default useEnsName;
