"use client";

import React from "react";
import { useAccount, useBalance } from "wagmi";

const UseTokenBalances: React.FC = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { data: balance, isLoading, isError, error } = useBalance({
    address,
  });

  if (isConnecting) return <p>Connecting...</p>;
  if (isDisconnected) return <p>Disconnected</p>;

  return (
    <div className="relative z-20">
      <>
        {isLoading && <p>Loading balance...</p>}
        {isError && <p>Error fetching balance: {String(error)}</p>}
        {balance && (
          <div>
            <h2>
              Total Balance: {balance.formatted} {balance.symbol}
            </h2>
          </div>
        )}
      </>
    </div>
  );
};

export default UseTokenBalances;
