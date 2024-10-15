"use client";

import React from "react";
import { useTokenBalances } from "@dynamic-labs/sdk-react-core";
import { calculateChainBalances } from "./multiChainBalance";

const UseTokenBalances: React.FC = () => {
  const { tokenBalances, isLoading, isError, error } = useTokenBalances({
    includeFiat: true,
    includeNativeBalance: true,
  });

  const { chainBalances, totalBalanceUSD } = React.useMemo(
    () => calculateChainBalances(tokenBalances),
    [tokenBalances]
  );

  return (
    <div className="relative z-20">
      <>
        {isLoading && <p>Loading balances...</p>}
        {isError && <p>Error fetching balances: {String(error)}</p>}
        {tokenBalances && (
          <div>
            <h2>
              Total Balance Across All Chains: ${totalBalanceUSD.toFixed(2)}
            </h2>
            {Object.entries(chainBalances).map(([chainKey, chainData]) => (
              <div key={chainKey}>
                <h3>
                  {chainData.chainName} - Total: $
                  {chainData.totalUSD.toFixed(2)}
                </h3>
                <ul>
                  {chainData.tokens.map((token) => (
                    <li key={`${token.networkId}-${token.address}`}>
                      <strong>
                        {token.name} ({token.symbol}):
                      </strong>
                      <ul>
                        <li>Balance: {token.balance.toFixed(4)}</li>
                        <li>Raw Balance: {token.rawBalance.toString()}</li>
                        <li>
                          USD Value: ${token.marketValue?.toFixed(2) || "N/A"}
                        </li>
                        <li>Price: ${token.price?.toFixed(6) || "N/A"}</li>
                        <li>Token Address: {token.address}</li>
                        <li>Decimals: {token.decimals}</li>
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </>
    </div>
  );
};

export default UseTokenBalances;
