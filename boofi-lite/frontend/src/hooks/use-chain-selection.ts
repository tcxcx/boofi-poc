import { useEffect } from 'react';
import { useMarketStore } from '@/store/marketStore';
import { getFromChains, getToChains } from '@/utils/chainMarket';
import { chains } from '@/utils/contracts';

export const useChainSelection = () => {
  const {
    currentViewTab,
    fromChain,
    toChain,
    setFromChain,
    setToChain,
  } = useMarketStore();

  useEffect(() => {
    const fromChains = getFromChains(currentViewTab, chains);
    const toChains = getToChains(currentViewTab, chains);

    // Only set default chains if they are not already set
    if (!fromChain) {
      setFromChain(fromChains[0]?.chainId.toString() || '');
    }
    if (!toChain) {
      setToChain(toChains[0]?.chainId.toString() || '');
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
