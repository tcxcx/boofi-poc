import React, { useState, ChangeEvent } from "react";
import { useAccount } from "wagmi";
import type { CurrencyDisplayerProps, Token } from "@/lib/types/index";
import { TokenBalanceDisplay } from "@/components/tokens-balance";
import { TokenAmountInput } from "@/components/token-amount";

const CurrencyDisplayerPay: React.FC<CurrencyDisplayerProps> = ({
  onValueChange,
  initialAmount = 0,
  availableTokens,
  onTokenSelect,
  currentNetwork,
}) => {
  const [selectedToken, setSelectedToken] = useState<Token | undefined>();
  const [inputValue, setInputValue] = useState<string>(initialAmount.toFixed(3));

  const { address } = useAccount();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (/^\d*\.?\d{0,4}$/.test(value) || value === "") {
      setInputValue(value);
      const numericValue = parseFloat(value);
      onValueChange(
        !isNaN(numericValue) ? numericValue : 0,
        !isNaN(numericValue) ? numericValue : 0
      );
    }
  };

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    onTokenSelect(token);
  };

  const handleMaxBalance = (balance: number) => {
    setInputValue(balance.toFixed(3));
    onValueChange(balance, balance);
  };

  return (
    <div className="mx-auto flex w-52 flex-col items-center">
      <TokenAmountInput
        value={inputValue}
        onChange={handleInputChange}
        selectedToken={selectedToken}
        availableTokens={availableTokens}
        onTokenSelect={handleTokenSelect}
        currentNetwork={currentNetwork}
      />

      {selectedToken && currentNetwork && (
        <TokenBalanceDisplay
          address={address}
          token={selectedToken}
          chainId={currentNetwork}
          onMaxClick={handleMaxBalance}
        />
      )}
    </div>
  );
};

export default CurrencyDisplayerPay;
