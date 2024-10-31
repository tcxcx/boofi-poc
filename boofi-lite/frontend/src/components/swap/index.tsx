"use client";

import React, { useState } from "react";

import { SwapToggleButton } from "./components/swapToggleButton";
import { SwapButton } from "./components/swapButton";
import { SwapAmountInput } from "./components/swapAmountInput";
import { useAccount } from "wagmi";
import type { Token } from "@coinbase/onchainkit/token";
import { ETHToken, USDCToken } from "@/utils/tokens";
import { cn } from "@/utils";

const swappableTokens: Token[] = [ETHToken, USDCToken];

export default function TokenSwap() {
  const [fromToken, setFromToken] = useState<Token>(ETHToken); // Token from
  const [toToken, setToToken] = useState<Token>(USDCToken); // Token to
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");

  const { address } = useAccount();

  if (!address) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="font-nupower text-xl">Please connect your wallet</div>
      </div>
    );
  }

  const handleFromAmountChange = (amount: string, selectedToken: Token) => {
    setFromAmount(amount);
  };

  const handleToAmountChange = (amount: string, selectedToken: Token) => {
    setToAmount(amount);
  };

  function handleToggle() {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <SwapAmountInput
        label="Sell"
        swappableTokens={swappableTokens}
        token={fromToken}
        setToken={setFromToken}
        amount={fromAmount}
        setAmount={setFromAmount}
        className={cn(
          "mb-2 p-4 bg-card dark:bg-darkCard border-2 border-border dark:border-darkBorder rounded-md",
          "focus-within:shadow-light dark:focus-within:shadow-dark"
        )}
        address={address}
        handleAmountChange={handleFromAmountChange}
        amountUSD={"100"} // Reemplaza con la lógica para convertir la cantidad a USD
        loading={false}
      />

      <div className="relative w-full flex justify-center items-center -mt-6 mb-2">
        <SwapToggleButton
          className="bg-main border-2 border-border dark:border-white rounded-full shadow-light dark:shadow-dark hover:bg-clr-yellow"
          handleToggle={handleToggle}
        />
      </div>

      <SwapAmountInput
        label="Buy"
        swappableTokens={swappableTokens}
        token={toToken}
        setToken={setToToken}
        amount={toAmount}
        setAmount={setToAmount}
        className={cn(
          "p-4 bg-card dark:bg-darkCard border-2 border-border dark:border-darkBorder rounded-md",
          "focus-within:shadow-light dark:focus-within:shadow-dark"
        )}
        address={address}
        handleAmountChange={handleToAmountChange}
        amountUSD={"100"}
        loading={false}
      />

      <SwapButton
        address={address}
        to={toToken}
        from={fromToken}
        setFrom={setFromToken}
        setTo={setToToken}
        handleAmountChange={handleFromAmountChange}
        lifecycleStatus={{ statusName: "transactionPending" }}
        className="mt-4 bg-main border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none"
      />
    </div>
  );
}
