"use client";

import React, { useEffect, useState } from "react";

import { SwapToggleButton } from "./components/swapToggleButton";
import { SwapAmountInput } from "./components/swapAmountInput";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { testnetTokensByChainId, USDCToken } from "@/utils/tokens";
import { cn } from "@/utils";
import { getCCIPChainByChainId } from "@/utils/contracts";
import { ChainSelect } from "../chain-select";
import { chains } from "@/utils/contracts";
import { erc20Abi, Hex } from "viem";
import { ethers } from "ethers";
import { Button } from "../ui/button";
import { CCIPTransferAbi } from "@/lib/abi/CCIP";
import { useEthersSigner } from "@/constants/wagmi";
import { parseUnits } from "viem";
import { useToast } from "@/components/ui/use-toast";
import { Token } from "@/lib/types";

export default function TokenSwap() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  const tokens = testnetTokensByChainId(chainId);
  const [fromToken, setFromToken] = useState<Token>(tokens[0]);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const { switchChain } = useSwitchChain();
  const [sourceChain, setSourceChain] = useState<string | null>(null);

  const [destinationChain, setDestinationChain] = useState<string | null>(null);
  const destinationChainInfo = getCCIPChainByChainId({
    chainId: Number(destinationChain),
  });

  const actualChain = getCCIPChainByChainId({ chainId });

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
    if (sourceChain && destinationChain && sourceChain === destinationChain) {
      console.warn("Source and destination chains cannot be the same.");
      return; // Exit the function early if they are the same
    }

    if (sourceChain && destinationChain && sourceChain !== destinationChain) {
      const currentSource = sourceChain;
      const currentDestination = destinationChain;

      // Find the name of the network for the current destination chain
      const destinationChainName =
        chains.find((chain) => chain.chainId === Number(currentDestination))
          ?.name || `Chain ID ${currentDestination}`;

      // Display a toast before switching networks
      toast({
        title: "Switching Network",
        description: `Switching network to ${destinationChainName}. Please check your wallet to allow network change.`,
      });

      setSourceChain(currentDestination);
      setDestinationChain(currentSource);

      switchChain({ chainId: Number(currentDestination) });
    } else {
      setSourceChain(String(chainId));
      setDestinationChain(null);
    }
  }

  const signer = useEthersSigner();
  async function sendCCIPTransfer() {
    const amount = parseUnits(toAmount, tokens[0]?.decimals);
    if (!destinationChainInfo?.ccipChainId) return;
    try {
      const contractERC20 = new ethers.Contract(
        tokens[0]?.address as Hex,
        erc20Abi,
        signer
      );

      const contract = new ethers.Contract(
        actualChain?.address as Hex,
        CCIPTransferAbi,
        signer
      );
      const allowance = await contractERC20.allowance(
        address,
        actualChain?.address as Hex
      );

      if (allowance < amount) {
        const txApprove = await contractERC20.approve(
          actualChain?.address as Hex,
          amount
        );
        await txApprove.wait();
      }

      const tx = await contract.transferTokensPayLINK(
        destinationChainInfo?.ccipChainId,
        address,
        tokens[0]?.address,
        amount
      );

      toast({
        title: "Transaction sent",
        description: "Transaction sent successfully",
        variant: "default",
      });
    } catch (error) {
      console.log({ error });
    }
  }

  return (
    <div className="flex flex-col items-center gap-10 text-nowrap">
      <div className="flex flex-col items-center gap-10 text-nowrap">
        <ChainSelect
          value={sourceChain ? sourceChain : chainId}
          onChange={(value) => {
            setSelectedToken("");
            setFromAmount("");
            if (chainId !== Number(value)) {
              switchChain({ chainId: Number(value) });
              setDestinationChain(null);
              setSourceChain(value);
            }
          }}
          chains={chains}
          label="Source Chain"
        />
        <div className="relative w-full flex justify-center items-center ">
          <SwapToggleButton
            className="bg-main border-2 border-border dark:border-white rounded-full shadow-light dark:shadow-dark hover:bg-clr-yellow"
            handleToggle={handleToggle}
          />
        </div>
        <ChainSelect
          value={destinationChain}
          onChange={(value) => {
            setSelectedToken("");
            setFromAmount("");
            if (chainId !== Number(value)) {
              setDestinationChain(value);
            }
          }}
          chains={chains}
          label="Bridge USDC to:"
        />
      </div>
      <SwapAmountInput
        label="Sell"
        swappableTokens={tokens}
        token={fromToken}
        setToken={setFromToken}
        amount={toAmount}
        setAmount={setToAmount}
        className={cn(
          "mb-2 p-4 bg-card dark:bg-darkCard border-2 border-border dark:border-darkBorder rounded-md",
          "focus-within:shadow-light dark:focus-within:shadow-dark"
        )}
        address={address || ""}
        handleAmountChange={handleFromAmountChange}
        amountUSD={"100"}
        loading={false}
      />

      <Button variant={"brutalism"} onClick={sendCCIPTransfer}>
        Bridge
      </Button>
    </div>
  );
}
