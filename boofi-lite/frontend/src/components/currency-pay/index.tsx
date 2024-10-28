import React, { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { InputMoney } from "../ui/input";
import { useAccount, useBalance, useChainId, useSwitchChain } from "wagmi";
import { getChainsForEnvironment } from "@/store/supportedChains";

import { Token } from "@/lib/types";
import { TokenChip } from "@coinbase/onchainkit/token";
import { toast } from "../ui/use-toast";

interface CurrencyDisplayerProps {
  tokenAmount: number;
  onValueChange: (usdAmount: number, tokenAmount: number) => void;
  initialAmount?: number;
  availableTokens: Token[];
  onTokenSelect: (token: string) => void;
  currentNetwork: number | null;
  currentToken: string;
}

const chainIcons: { [key: number]: string } = {
  11155111: "/icons/ethereum-eth-logo.svg",
  11155420: "/icons/optimism-ethereum-op-logo.svg",
  84532: "/icons/base-logo-in-blue.svg",
  43113:
    "https://bafybeihfbjhiz5rytxcug7l7ymu6veyam5dcdrmqevz2jkepsgec6xobgi.ipfs.web3approved.com/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaWQiOiJiYWZ5YmVpaGZiamhpejVyeXR4Y3VnN2w3eW11NnZleWFtNWRjZHJtcWV2ejJqa2Vwc2dlYzZ4b2JnaSIsInByb2plY3RfdXVpZCI6Ijc2YTA4NzgxLTViMDctNGRhMy1iZDNhLTBiNDc2ZjRhY2YyMiIsImlhdCI6MTcyOTE5NTczMiwic3ViIjoiSVBGUy10b2tlbiJ9.Or8FYayDjxvOSgW-ZjTLYksp9-0fXa7pKmKFQPUNZL4",
};

const CurrencyDisplayerPay = ({
  tokenAmount,
  onValueChange,
  initialAmount = 0,
  availableTokens,
  onTokenSelect,
  currentNetwork,
}: CurrencyDisplayerProps) => {
  const tokenPriceInUSD = 0.02959;
  const [usdAmount, setUsdAmount] = useState<number>(0);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>(
    initialAmount.toFixed(3)
  );
  const chainId = useChainId();

  const { address } = useAccount();
  const { data: balance, isLoading: wagmiLoading } = useBalance({
    address,
    chainId,
  });

  const supportedChains = getChainsForEnvironment();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (chainId !== currentNetwork) {
      toast({
        title: "Please switch to the correct network.",
      });
      switchChain({
        chainId: currentNetwork,
      });

      handleSelectChange(
        availableTokens.find((token) => token.name === selectedToken)?.name ||
          ""
      );

      console.log(selectedToken, "selected token in use effect ooooaoaooa");
    }
  }, [chainId, currentNetwork]);

  const handleSelectChange = (value: string) => {
    setSelectedToken(value.toUpperCase());

    const token = availableTokens.find((token) => token.name === value);
    onTokenSelect(token?.address as string);
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
    // const token = availableTokens.find(
    //   (token) => token.symbol === selectedToken
    // );
    // const { data: balance } = useBalance({
    //   address,
    //   chainId,
    //   token: token?.address,
    // });
    // return selectedToken === "ETH"
    //   ? balance
    //     ? parseFloat(formatUnits(balance?.value, balance?.decimals))
    //     : 0
    //   : balance
    //   ? parseFloat(formatUnits(balance?.value, balance?.decimals))
    //   : 0;
    return 0;
  };

  const handleMaxClick = () => {
    if (getAvailableBalance() === 0) {
      toast({
        title: "No balance",
        description: "You have no balance for this token",
      });
      return;
    }
    const maxBalance = getAvailableBalance()?.toFixed(3);
    setInputValue(maxBalance);
    updateValues(maxBalance);
  };

  const renderAvailableBalance = () => {
    if (wagmiLoading) {
      return <p className="text-xs">Loading balance...</p>;
    }
    const displayBalance = getAvailableBalance().toFixed(3);
    return (
      <>
        <Button variant={"link"} className="text-xs" onClick={handleMaxClick}>
          Available balance (Max):
        </Button>
        <Button variant={"link"} className="text-xs" onClick={handleMaxClick}>
          {displayBalance} {getTokenSymbolForNetwork(selectedToken)}
        </Button>
      </>
    );
  };

  useEffect(() => {
    console.log({ selectedToken });
  }, [selectedToken]);

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
                {selectedToken}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-full justify-between">
          <SelectGroup className="justify-stretch gap-2">
            {availableTokens.map((token) => (
              <SelectItem
                value={token.name}
                onClick={() => setSelectedToken(token.name)}
                className="flex flex-row items-center justify-center w-full "
              >
                <TokenChip
                  token={token}
                  className="w-full bg-white hover:bg-white m-auto"
                />
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencyDisplayerPay;
