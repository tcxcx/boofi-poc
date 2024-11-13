import { useEnsName as useEnsNameWagmi } from "wagmi";
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

  if (result.data) {
    ensName = result.data;
  } else {
    ensName = truncateAddress(address);
  }

  return { ensName, isLoading: result.isLoading, ensNotFound: !result.data };
}

export default useEnsName;
