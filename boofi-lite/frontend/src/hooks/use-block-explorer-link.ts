import { useEffect, useState } from "react";
import { Chain } from "viem/chains";
import { getBlockExplorerUrl } from "@/utils/index";

export enum HashType {
  Address = "address",
  Transaction = "tx",
}

/**
 * A React hook to generate a BlockExplorer (e.g., etherscan) link.
 * @param {Object} chain - The chain object from wagmi.
 * @param {string} hash - The contract or transaction hash.
 * @param {HashType} type - The type of hash (address or transaction).
 * @returns {string} - The URL to the BlockExplorer page for the given hash.
 */
export function useBlockExplorerLink(
  chain: Chain,
  hash: string | undefined,
  type: HashType = HashType.Address
) {
  const [link, setLink] = useState("");

  useEffect(() => {
    if (chain && hash) {
      const explorerUrl = getBlockExplorerUrl(chain);
      setLink(`${explorerUrl}/${type.toString()}/${hash}`);
    }
  }, [chain, hash, type]);

  return link;
}
