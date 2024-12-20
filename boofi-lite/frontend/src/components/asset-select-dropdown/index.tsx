'use client';

import { useEffect, useMemo } from 'react';
import { useMarketStore } from "@/store/marketStore";
import { currencyAddresses } from "@/utils/currencyAddresses";
import { CurrencyInfo } from "@/lib/types";
import { Token } from '@coinbase/onchainkit/token';
import { TokenSelectDropdown } from '@coinbase/onchainkit/token';
import { tokens } from "@/utils/tokens";

export function AssetSelector() {
  const { selectedAsset, setSelectedAsset } = useMarketStore();

  const options = useMemo(() => {
    const uniqueAssets = new Set<string>();

    const tokenMap = new Map(tokens.map(token => [token.symbol, token]));

    return Object.entries(currencyAddresses)
      .flatMap(([chainId, currencies]) => 
        Object.entries(currencies).map(([symbol, info]) => {
          const currencyInfo = info as CurrencyInfo;
          const tokenInfo = tokenMap.get(symbol);

          if (uniqueAssets.has(symbol)) return null; // Skip if already listed

          uniqueAssets.add(symbol);
          return {
            name: symbol,
            address: currencyInfo.address as `0x${string}`,
            symbol: symbol,
            decimals: currencyInfo.decimals || 18,
            image: tokenInfo?.image || `/assets/tokens/${symbol.toLowerCase()}.png`,
            chainId: parseInt(chainId),
          };
        })
      )
      .filter(Boolean);
  }, []);

  useEffect(() => {
    if (!selectedAsset && options.length > 0) {
      setSelectedAsset(options[0] as Token);
    }
  }, [selectedAsset, setSelectedAsset, options]);

  const handleAssetChange = (newAsset: Token) => {
    setSelectedAsset(newAsset);
  };

  return (
    <div className="w-[200px]">
      <TokenSelectDropdown
        token={selectedAsset as Token}
        setToken={handleAssetChange}
        options={options as Token[]}
      />
    </div>
  );
}
