import { useState } from "react";
import { useAccount, useSwitchChain, useReadContract } from "wagmi";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { TransactionHistoryItem } from "@/lib/types";
import { useTokenBalance } from "@/hooks/blockchain/use-token-balance";
import { useChainSelection } from "@/hooks/use-chain-selection";
import { ChainSelect } from "@/components/chain-select";
import { BalanceDisplay } from "@/components/balance-display";
import { getUSDCAddress } from "@/lib/utils";
import { TransactionError } from "@/lib/types";
import { useEthersSigner } from "@/lib/wagmi/wagmi";
import { WagmiActionButton } from "@/components/wagmi-buttons/action-button";
import { spokeAbi } from "@/utils/abis";
import { Abi, parseUnits } from "viem";
import { currencyAddresses } from "@/utils/currencyAddresses";

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
  const [amount, setAmount] = useState("");
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistoryItem[]>([]);

  const chainId = fromChain ? Number(fromChain) : 84532;
  const usdcAddress = getUSDCAddress(chainId);
  const assetAmount = parseUnits(amount || "0", 6);
  const spokeContract = currencyAddresses[chainId]?.USDC?.spokeContract;

  const {
    data: deliveryCost,
    isLoading: isLoadingDeliveryCost,
  } = useReadContract({
    address: spokeContract as `0x${string}`,
    abi: spokeAbi,
    functionName: "getDeliveryCostRoundtrip",
    args: [1n, true],
    query: {
      enabled: !!spokeContract,
    }
  }) as { data: bigint | undefined; isLoading: boolean };

  const costForReturnDelivery = deliveryCost || 1000000n;

  // Get action configuration based on current tab
  const getActionConfig = () => {
    const baseValue = costForReturnDelivery;

    switch (currentViewTab) {
      case 'lend':
        return {
          functionName: "depositCollateral",
          buttonText: "Deposit USDC",
          loadingText: "Depositing...",
          args: [usdcAddress, assetAmount, baseValue],
          value: baseValue
        };
      case 'withdraw':
        return {
          functionName: "withdrawCollateral",
          buttonText: "Withdraw USDC",
          loadingText: "Withdrawing...",
          args: [usdcAddress, assetAmount, baseValue],
          value: baseValue
        };
      case 'borrow':
        return {
          functionName: "borrow",
          buttonText: "Borrow USDC",
          loadingText: "Borrowing...",
          args: [usdcAddress, assetAmount, baseValue],
          value: baseValue
        };
      case 'repay':
        return {
          functionName: "repay",
          buttonText: "Repay USDC",
          loadingText: "Repaying...",
          args: [usdcAddress, assetAmount, baseValue],
          value: baseValue
        };
      default:
        return null;
    }
  };

  const actionConfig = getActionConfig();

  const handleTransactionSuccess = () => {
    console.log("Transaction successful");
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

  if (!actionConfig) return null;

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
            <WagmiActionButton
              abi={spokeAbi as unknown as Abi[]}
              address={spokeContract as `0x${string}`}
              functionName={actionConfig.functionName}
              args={actionConfig.args}
              buttonText={actionConfig.buttonText}
              loadingText={actionConfig.loadingText}
              chainId={chainId}
              onSuccess={handleTransactionSuccess}
              onError={handleTransactionError}
              variant="brutalism"
              className="w-full p-4 justify-center bg-clr-blue text-black dark:text-black hover:bg-blue-600/80 border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none"
            />
          </div>
        </div>
        <Separator />
      </div>
    </div>
  );
}