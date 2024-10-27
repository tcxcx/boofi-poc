// CurrencyDisplayer.tsx

import React, { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import styled from "styled-components";
import { Eth } from "@styled-icons/crypto/Eth";
import { Usdc } from "@styled-icons/crypto/Usdc";
import { InputMoney } from "../ui/input";
import { useAccount, useBalance, useChainId } from "wagmi";
import { getChainsForEnvironment } from "@/store/supportedChains";
import { formatUnits } from "viem";
import { useWindowSize } from "@/hooks/use-window-size";
import { CurrencyDisplayerProps } from "@/lib/types";

const chainIcons: { [key: number]: string } = {
  11155111: "/icons/ethereum-eth-logo.svg",
  84532: "/icons/base-logo-in-blue.svg",
  43113: "/icons/avalanche-avax-logo.svg",
};

const CurrencyDisplayer: React.FC<CurrencyDisplayerProps> = ({
  tokenAmount,
  onValueChange,
  initialAmount = 0,
  availableTokens,
  onTokenSelect,
  currentNetwork,
}) => {
  const [usdAmount, setUsdAmount] = useState<number>(0);
  const [selectedToken, setSelectedToken] = useState<string>("ETH");
  const [inputValue, setInputValue] = useState<string>(
    initialAmount.toFixed(3)
  );
  const { width } = useWindowSize();
  const chainId = useChainId();

  const isMobile = width && width <= 768;

  const { address } = useAccount();
  const { data: balance, isLoading: wagmiLoading } = useBalance({
    address,
    chainId,
    token: selectedToken !== "ETH" ? `0x${availableTokens[selectedToken]}` : undefined,
  });

  const supportedChains = getChainsForEnvironment();

  useEffect(() => {
    if (chainId !== currentNetwork) {
      console.warn("Please switch to the correct network.");
    }
  }, [chainId, currentNetwork]);

  const EthIcon = styled(Eth)`
    color: #627eea;
  `;

  const UsdcIcon = styled(Usdc)`
    color: #2775ca;
  `;

  const handleSelectChange = (value: string) => {
    const tokenSymbol = value.toUpperCase();
    setSelectedToken(tokenSymbol);
    onTokenSelect(tokenSymbol);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const regex = /^\d*\.?\d{0,6}$/; // Adjusted to 6 decimal places

    if (regex.test(value) || value === "") {
      setInputValue(value);
      updateValues(value);
    }
  };

  const updateValues = (value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      onValueChange(0, numericValue);
    } else {
      onValueChange(0, 0);
    }
  };

  const getAvailableBalance = () => {
    if (balance && balance.value) {
      return parseFloat(formatUnits(balance.value, balance.decimals));
    }
    return 0;
  };

  const handleMaxClick = () => {
    const maxBalance = getAvailableBalance().toFixed(6);
    setInputValue(maxBalance);
    updateValues(maxBalance);
  };

  const renderAvailableBalance = () => {
    if (wagmiLoading) {
      return <p className="text-xs">Loading balance...</p>;
    }
    const displayBalance = getAvailableBalance().toFixed(6);
    return (
      <>
        <Button variant={"link"} className="text-xs" onClick={handleMaxClick}>
          Available balance (Max):
        </Button>
        <Button variant={"link"} className="text-xs" onClick={handleMaxClick}>
          {displayBalance} {selectedToken}
        </Button>
      </>
    );
  };

  const getTokenIcon = (token: string) => {
    switch (token.toUpperCase()) {
      case "USDC":
        return <UsdcIcon size={20} />;
      case "ETH":
        return <EthIcon size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto flex w-52 flex-col items-center">
      <div className="relative mb-2 text-center text-4xl">
        <div className="relative flex justify-center text-6xl">
          <InputMoney
            placeholder="0.0000"
            value={inputValue}
            onChange={handleInputChange}
            className="text-center w-full"
          />
        </div>
        <div className="text-xs text-red-500 mb-2"></div>
      </div>
      <div className="mx-auto mt-2 block text-xs w-full items-center justify-between">
        {renderAvailableBalance()}
      </div>

      <Select onValueChange={handleSelectChange} value={selectedToken.toLowerCase()}>
        <SelectTrigger className="w-full border-transparent flex justify-between">
          <SelectValue>
            {selectedToken && currentNetwork && (
              <div className="flex items-center">
                <img
                  src={chainIcons[currentNetwork]}
                  alt={
                    supportedChains.find((chain) => chain.id === currentNetwork)
                      ?.name || "Ethereum"
                  }
                  className="inline-block w-4 h-4 mr-2"
                />
                {selectedToken}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-full justify-between">
          <SelectGroup className="justify-stretch">
            <SelectLabel>Tokens</SelectLabel>
            {Object.keys(availableTokens).map((token) => (
              <SelectItem key={token} value={token.toLowerCase()}>
                {getTokenIcon(token)} {token}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Native Token</SelectLabel>
            <SelectItem value="eth">
              <EthIcon size={20} /> ETH
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencyDisplayer;
