import {
  TokenChip,
  TokenImage,
  formatAmount,
} from "@coinbase/onchainkit/token";
import { Button } from "@/components/ui/button";
import { InputMoney } from "@/components/ui/input";
import type React from "react";
import { type ChangeEvent, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";

interface CurrencyDisplayerProps {
  tokenAmount: number;
  onValueChange: (usdAmount: number, tokenAmount: number) => void;
  initialAmount?: number;
  availableTokens: { USDC: string };
  onTokenSelect: (token: string) => void;
}

const supportedNetworks = [
  {
    id: 8453,
    name: "Base",
    icon: null, // We will use TokenImage instead
    chainId: 8453,
  },
  {
    id: 10,
    name: "Optimism",
    icon: null, // We will use TokenImage instead
    chainId: 10,
  },
];

const CurrencyDisplayer: React.FC<CurrencyDisplayerProps> = ({
  tokenAmount,
  onValueChange,
  initialAmount = 0,
  availableTokens,
  onTokenSelect,
}) => {
  const [inputValue, setInputValue] = useState<string>(
    initialAmount.toFixed(6),
  );
  const { address } = useAccount();
  const chainId = 8453; // Default chainId; adjust as needed

  const { data: balance, isLoading: balanceLoading } = useBalance({
    address,
    token: availableTokens.USDC as `0x${string}`,
  });

  const [selectedToken, setSelectedToken] = useState({
    name: "USD Coin",
    address: availableTokens.USDC as `0x${string}`,
    symbol: "USDC",
    decimals: 6,
    image: null, // Will use TokenImage to handle null image
    chainId: chainId,
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const regex = /^\d*\.?\d{0,6}$/;

    if (regex.test(value) || value === "") {
      setInputValue(value);
      updateValues(value);
    }
  };

  const updateValues = (value: string) => {
    const numericValue = Number.parseFloat(value);
    if (!Number.isNaN(numericValue)) {
      onValueChange(numericValue, numericValue);
    } else {
      onValueChange(0, 0);
    }
  };

  const handleMaxClick = () => {
    if (balance) {
      // Convert balance.value (bigint) to a formatted string considering decimals
      const maxBalanceRaw = formatUnits(balance.value, balance.decimals);
      const maxBalance = formatAmount(maxBalanceRaw, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      });
      setInputValue(maxBalance);
      updateValues(maxBalance);
    }
  };

  const renderAvailableBalance = () => {
    if (balanceLoading) {
      return <p className="text-xs">Loading balance...</p>;
    }
    if (!balance) {
      return <p className="text-xs text-red-500">Error fetching balance</p>;
    }

    const displayBalanceRaw = formatUnits(balance.value, balance.decimals);
    const displayBalance = formatAmount(displayBalanceRaw, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });

    return (
      <>
        <Button variant="outline" className="text-xs" onClick={handleMaxClick}>
          Available balance (Max):
        </Button>
        <Button variant="outline" className="text-xs" onClick={handleMaxClick}>
          {displayBalance} {selectedToken.symbol}
        </Button>
      </>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center bg-secondaryBlack p-6 rounded-lg border-2 border-mainAccent">
      <div className="relative mb-4 text-center">
        <div className="relative flex justify-center text-4xl sm:text-6xl">
          <InputMoney
            placeholder="0.000000"
            value={inputValue}
            onChange={handleInputChange}
            className="text-center w-full bg-darkBg text-white border-2 border-main rounded-none p-2"
          />
        </div>
      </div>
      <div className="mx-auto mt-2 block text-xs w-full items-center justify-between">
        {renderAvailableBalance()}
      </div>

      <div className="w-full mt-4">
        <TokenChip
          token={selectedToken}
          onClick={() => {
            // Implement token selection logic if necessary
            // For now, since only USDC is available, we'll keep it static
          }}
        />
      </div>

      <div className="mt-4 w-full">
        <p className="text-sm font-bold mb-2">Supported Networks:</p>
        <div className="flex space-x-2">
          {supportedNetworks.map((network) => (
            <div
              key={network.id}
              className="flex items-center bg-darkBg p-2 rounded"
            >
              <TokenImage
                token={{
                  name: network.name,
                  address:
                    "0x0000000000000000000000000000000000000000" as `0x${string}`,
                  symbol: network.name,
                  decimals: 18,
                  image: null,
                  chainId: network.chainId,
                }}
                size={24}
              />
              <span className="text-sm ml-2">{network.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrencyDisplayer;
