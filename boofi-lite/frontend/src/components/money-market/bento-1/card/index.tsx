"use client";

import { useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import TransferWrapper from "@/components/money-market/transfer-wrapper";
import { Token, TransactionHistoryItem } from "@/lib/types";
import { useTokenBalance } from "@/hooks/blockchain/use-token-balance";
import { useChainSelection } from "@/hooks/use-chain-selection";
import { ChainSelect } from "@/components/chain-select";
import { BalanceDisplay } from "@/components/balance-display";

import { useEthersSigner } from "@/lib/wagmi/wagmi";
import { useGetTokenOrChainById } from "@/hooks/use-get-token-or-chain-by-id";
export function MoneyMarketCard() {
  const { address } = useAccount();
  const [usdcBalance, setUsdcBalance] = useState<string | undefined>(undefined);
  const {
    currentViewTab,
    fromChain,
    toChain,
    setFromChain,
    setToChain,
    fromChains,
    toChains,
  } = useChainSelection();
  const signer = useEthersSigner();

  if (!fromChain && fromChains.length > 0) {
    setFromChain(fromChains[0].chainId.toString());
  }

  if (!toChain && toChains.length > 0) {
    setToChain(toChains[0].chainId.toString());
  }

  const { switchChain } = useSwitchChain();
  const [amount, setAmount] = useState("");
  const [transactionHistory, setTransactionHistory] = useState<
    TransactionHistoryItem[]
  >([]);

  const chainId = fromChain ? Number(fromChain) : 84532;
  const tokens = useGetTokenOrChainById(chainId, "token") as Token[];
  const usdcAddress = tokens.filter((token) => token.symbol === "USDC")[0]
    ?.address;
  const usdcDecimals = 6; // USDC has 6 decimals

  const getUsdcBalance = useTokenBalance({
    tokenAddress: usdcAddress as `0x${string}`,
    chainId: chainId!,
    address: address as `0x${string}`,
    signer: signer,
    setBalance: setUsdcBalance,
  });

  const transferActions = {
    lend: { functionName: "depositCollateral", buttonText: "Deposit USDC" },
    withdraw: {
      functionName: "withdrawCollateral",
      buttonText: "Withdraw USDC",
    },
    borrow: { functionName: "borrow", buttonText: "Borrow USDC" },
    repay: { functionName: "repay", buttonText: "Repay USDC" },
  };

  const action =
    transferActions[currentViewTab as keyof typeof transferActions] || {};
  const { functionName, buttonText } = action;

  const handleTransactionSuccess = (txHash: string) => {
    console.log("Transaction successful:", txHash);
    setTransactionHistory((prev) => [
      ...prev,
      {
        date: new Date().toLocaleString(),
        amount: parseFloat(amount),
        status: "Success",
      },
    ]);
  };

  const handleTransactionError = (error: Error) => {
    console.error("Transaction failed:", error);
    setTransactionHistory((prev) => [
      ...prev,
      {
        date: new Date().toLocaleString(),
        amount: parseFloat(amount),
        status: "Failed",
      },
    ]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col space-y-4 w-full">
        <Separator />
        <div className="flex items-center justify-between">
          <ChainSelect
            value={fromChain}
            onChange={setFromChain}
            chains={fromChains}
            label="From"
          />
          <Separator orientation="vertical" className="h-8 mx-4" />
          <ChainSelect
            value={toChain}
            onChange={setToChain}
            chains={toChains}
            label="To"
          />
        </div>
        <Separator />
        <div className="flex items-start justify-between">
          <div className="w-1/2 pr-2 pt-2">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-4xl font-bold h-16 w-full"
            />
            <BalanceDisplay
              balance={usdcBalance || "0"}
              isLoading={!usdcBalance}
              symbol="USDC"
            />
          </div>
          <div className="w-1/2 p-4">
            <TransferWrapper
              amount={amount}
              onSuccess={handleTransactionSuccess}
              onError={handleTransactionError}
              functionName={functionName}
              buttonText={buttonText}
            />
          </div>
        </div>
        <Separator />
      </div>
    </div>
  );
}
