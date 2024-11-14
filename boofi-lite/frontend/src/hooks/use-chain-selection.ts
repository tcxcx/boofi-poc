import { useEffect } from "react";
import { useMarketStore } from "@/store/marketStore";
import { getFromChains, getToChains } from "@/utils/chainMarket";
import { chains } from "@/utils/contracts";

export const useChainSelection = () => {
  const { currentViewTab, fromChain, toChain, setFromChain, setToChain } =
    useMarketStore();

  useEffect(() => {
    const fromChains = getFromChains(currentViewTab, chains);
    const toChains = getToChains(currentViewTab, chains);

    // Ensure chains are populated based on the current tab
    if (
      !fromChain ||
      !fromChains.find((chain) => chain.chainId.toString() === fromChain)
    ) {
      setFromChain(fromChains[0]?.chainId.toString() || "");
    }
    if (
      !toChain ||
      !toChains.find((chain) => chain.chainId.toString() === toChain)
    ) {
      setToChain(toChains[0]?.chainId.toString() || "");
    }
  }, [currentViewTab, setFromChain, setToChain, fromChain, toChain]);

  return {
    currentViewTab,
    fromChain,
    toChain,
    setFromChain,
    setToChain,
    fromChains: getFromChains(currentViewTab, chains),
    toChains: getToChains(currentViewTab, chains),
  };
};
