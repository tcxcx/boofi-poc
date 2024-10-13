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
import { Dai } from "@styled-icons/crypto/Dai";
import { Usdt } from "@styled-icons/crypto/Usdt";
import { InputMoney } from "../ui/input";
import { useTokenBalances, useUserWallets } from "@dynamic-labs/sdk-react-core";
import { useAccount, useBalance, useChainId } from "wagmi";
import { getChainsForEnvironment } from "@/store/supportedChains";
import { calculateChainBalances } from "@/utils/multiChainBalance";
import { formatUnits } from "viem";
import { useWindowSize } from "@/hooks/use-window-size";
import { useAuthStore } from "@/store/authStore";
import { ChainId } from "@/lib/types";
import { celo, celoAlfajores } from "viem/chains";
import { useEnhancedMinipayBalances } from "@/hooks/use-minipay-balance";

interface CurrencyDisplayerProps {
  tokenAmount: number;
  onValueChange: (usdAmount: number, tokenAmount: number) => void;
  initialAmount?: number;
  availableTokens: Record<string, string>;
  onTokenSelect: (token: string) => void;
  currentNetwork: number | null;
  isMiniPay: boolean;
}

const chainIcons: { [key: number]: string } = {
  1: "/icons/ethereum-eth-logo.svg",
  11155111: "/icons/ethereum-eth-logo.svg",
  10: "/icons/optimism-ethereum-op-logo.svg",
  11155420: "/icons/optimism-ethereum-op-logo.svg",
  42220: "/icons/celo-celo-logo.svg",
  8453: "/icons/base-logo-in-blue.svg",
  84532: "/icons/base-logo-in-blue.svg",
  34443: "/icons/mode-logo.svg",
  919: "/icons/mode-logo.svg",
};

const CurrencyDisplayer: React.FC<CurrencyDisplayerProps> = ({
  tokenAmount,
  onValueChange,
  initialAmount = 0,
  availableTokens,
  onTokenSelect,
  currentNetwork,
  isMiniPay,
}) => {
  const tokenPriceInUSD = 0.02959;
  const [usdAmount, setUsdAmount] = useState<number>(0);
  const [selectedToken, setSelectedToken] = useState<string>("CUSD");
  const [inputValue, setInputValue] = useState<string>(
    initialAmount.toFixed(3)
  );
  const { width } = useWindowSize();
  const chainId = useChainId();

  const isMobile = width && width <= 768;

  const {
    tokenBalances = [],
    isLoading: dynamicLoading,
    error: dynamicError,
  } = useTokenBalances();

  const {
    balances: minipayBalances,
    error: minipayError,
    loading: minipayLoading,
  } = useEnhancedMinipayBalances();

  const userWallets = useUserWallets() || [];
  const { address } = useAccount();
  const { data: balance, isLoading: wagmiLoading } = useBalance({
    address,
    chainId: currentNetwork as ChainId,
  });

  const supportedChains = getChainsForEnvironment();

  const { chainBalances, totalBalanceUSD } =
    calculateChainBalances(tokenBalances);

  useEffect(() => {
    if (isMiniPay && chainId !== celo.id && chainId !== celoAlfajores.id) {
      console.warn(
        "MiniPay detected but not on Celo network. Please switch to Celo network manually."
      );
    }
  }, [isMiniPay, chainId]);

  const EthIcon = styled(Eth)`
    color: #627eea;
    &:hover,
    &:active {
      color: #627eea;
    }
  `;

  const UsdcIcon = styled(Usdc)`
    color: #2775ca;
    &:hover,
    &:active {
      color: #2775ca;
    }
  `;

  const DaiIcon = styled(Dai)`
    color: #f4b731;
    &:hover,
    &:active {
      color: #f4b731;
    }
  `;

  const UsdtIcon = styled(Usdt)`
    color: #26a17b;
    &:hover,
    &:active {
      color: #26a17b;
    }
  `;

  const handleSelectChange = (value: string) => {
    setSelectedToken(value.toUpperCase());
    onTokenSelect(value.toUpperCase());
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const regex = /^\d*\.?\d{0,4}$/;

    if (regex.test(value) || value === "") {
      setInputValue(value);
      updateValues(value);
    }
  };

  const updateValues = (value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      const usdValue = numericValue * tokenPriceInUSD;
      setUsdAmount(isFinite(usdValue) ? parseFloat(usdValue.toFixed(2)) : 0);
      onValueChange(
        isFinite(usdValue) ? parseFloat(usdValue.toFixed(2)) : 0,
        numericValue
      );
    } else {
      onValueChange(0, 0);
    }
  };

  const getTokenSymbolForNetwork = (baseSymbol: string) => {
    if (currentNetwork === 84532 && baseSymbol === "ETH") {
      return "ETH Sepolia";
    }
    return baseSymbol;
  };

  const getAvailableBalance = () => {
    if (isMiniPay) {
      return minipayBalances[selectedToken]
        ? parseFloat(minipayBalances[selectedToken] || "0")
        : 0;
    }
    const currentChainBalance = chainBalances[currentNetwork?.toString() || ""];
    const tokenBalance = currentChainBalance?.tokens.find(
      (token) => token.symbol === selectedToken
    );
    return selectedToken === "ETH"
      ? balance
        ? parseFloat(formatUnits(balance?.value, balance?.decimals))
        : 0
      : tokenBalance?.balance
      ? parseFloat(tokenBalance.balance.toString())
      : 0;
  };

  const handleMaxClick = () => {
    const maxBalance = getAvailableBalance().toFixed(3);
    setInputValue(maxBalance);
    updateValues(maxBalance);
  };

  const renderAvailableBalance = () => {
    if (isMiniPay) {
      if (minipayLoading) {
        return <p className="text-xs">Loading MiniPay balance...</p>;
      }
      if (minipayError) {
        console.error("MiniPay error:", minipayError);
        return (
          <p className="text-xs text-red-500">
            Error fetching MiniPay balance: {minipayError}
          </p>
        );
      }
      const displayBalance = minipayBalances[selectedToken] || "0";
      return (
        <>
          <Button variant={"link"} className="text-xs" onClick={handleMaxClick}>
            Available balance (Max):
          </Button>
          <Button variant={"link"} className="text-xs" onClick={handleMaxClick}>
            {displayBalance} {getTokenSymbolForNetwork(selectedToken)}{" "}
          </Button>
        </>
      );
    } else {
      if (dynamicLoading || wagmiLoading) {
        return <p className="text-xs">Loading balance...</p>;
      }
      if (dynamicError || !balance) {
        console.error("Error fetching balance:", dynamicError);
        return (
          <p className="text-xs text-red-500">
            Error fetching balance in CURRENCY
          </p>
        );
      }
      const displayBalance = getAvailableBalance().toFixed(3);
      return (
        <>
          <Button variant={"link"} className="text-xs" onClick={handleMaxClick}>
            Available balance (Max):
          </Button>
          <Button variant={"link"} className="text-xs" onClick={handleMaxClick}>
            {displayBalance} {getTokenSymbolForNetwork(selectedToken)}{" "}
          </Button>
        </>
      );
    }
  };

  const getTokenIcon = (token: string) => {
    switch (token.toUpperCase()) {
      case "USDC":
        return <UsdcIcon size={20} />;
      case "DAI":
        return <DaiIcon size={20} />;
      case "USDT":
        return <UsdtIcon size={20} />;
      case "CUSD":
        return (
          <img
            src="/icons/celo-dollar_large.webp"
            alt="cUSD"
            className="inline-block w-4 h-4 mr-2"
          />
        );
      case "ETH":
        return <EthIcon size={20} />;
      case "CELO":
        return (
          <img
            src="/icons/celo-celo-logo.svg"
            alt="CELO"
            className="inline-block w-4 h-4 mr-2"
          />
        );
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
        <div className="text-xs text-red-500 mb-2">
          {/* <p>isMiniPay: {isMiniPay ? "true" : "false"}</p>
          <p>minipayLoading: {minipayLoading ? "true" : "false"}</p>
          <p>minipayError: {minipayError || "No"}</p>
          <p>minipayBalances: {JSON.stringify(minipayBalances)}</p>
          <p>dynamicLoading: {dynamicLoading ? "true" : "false"}</p>
          <p>wagmiLoading: {wagmiLoading ? "true" : "false"}</p>
          <p>dynamicError: {dynamicError ? "Yes" : "No"}</p>
          <p>balance: {balance ? "Exists" : "Null"}</p>
          <p>selectedToken: {selectedToken}</p>
          <p>currentNetwork: {currentNetwork}</p> */}
        </div>
      </div>
      <div className="mx-auto mt-2 block text-xs w-full items-center justify-between">
        {renderAvailableBalance()}
      </div>

      <Select onValueChange={handleSelectChange}>
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
                {getTokenSymbolForNetwork(selectedToken)}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-full justify-between">
          <SelectGroup className="justify-stretch">
            <SelectLabel>Stablecoins</SelectLabel>
            {isMiniPay
              ? ["CUSD"].map((token) => (
                  <SelectItem key={token} value={token.toLowerCase()}>
                    {getTokenIcon(token)} {token}
                  </SelectItem>
                ))
              : Object.keys(availableTokens).map((token) => (
                  <SelectItem key={token} value={token.toLowerCase()}>
                    {getTokenIcon(token)} {token}
                  </SelectItem>
                ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Cryptocurrencies</SelectLabel>
            {isMiniPay ? (
              <SelectItem value="celo">{getTokenIcon("CELO")} CELO</SelectItem>
            ) : (
              <SelectItem value="eth">
                <EthIcon size={20} /> {getTokenSymbolForNetwork("ETH")}
              </SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencyDisplayer;
