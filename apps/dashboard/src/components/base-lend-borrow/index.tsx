import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { formatAmount } from "@coinbase/onchainkit/token";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import {
  ConnectWallet,
  Wallet as WalletComponent,
} from "@coinbase/onchainkit/wallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@midday/ui/tabs";
import { useToast } from "@midday/ui/use-toast";
import { ArrowLeft, ArrowRight, InfoIcon, RefreshCw } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { type Abi, type WriteContractParameters, parseUnits } from "viem";
import { base } from "viem/chains";
import { useAccount } from "wagmi";
import CurrencyDisplayer from "./currency-displayer";
import TransactionDetails from "./transaction-component";

// Import your contract ABIs and addresses
import SpokeABI from "../abis/Spoke.json";
import { SpokeAddress } from "../config/contracts";

export default function LendBorrow() {
  const [activeTab, setActiveTab] = useState("supply");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  const { address } = useAccount();

  // Define the chain
  const chain = base; // Default to Base chain

  const [contracts, setContracts] = useState<WriteContractParameters[]>([]);

  const availableTokens: { USDC: string } = {
    USDC: "0x833589fCD6eDb6E08f4c7C32d4f71b54bdA02913", // USDC on Base
  };

  const handleOnStatus = useCallback(
    (status: LifecycleStatus) => {
      console.log("Transaction Status:", status);
      if (status.statusName === "success") {
        toast({
          title: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Successful`,
          description: `You have ${activeTab}ed ${formatAmount(amount, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          })} USDC.`,
        });
      }
      if (status.statusName === "error") {
        toast({
          title: "Transaction Failed",
          description: `There was an error processing your ${activeTab}.`,
          variant: "destructive",
        });
      }
    },
    [activeTab, amount, toast],
  );

  const prepareContracts = () => {
    if (!amount || !address) return;

    const assetAddress = availableTokens.USDC as `0x${string}`;
    const assetAmount = parseUnits(amount || "0", 6); // USDC has 6 decimals

    let contractCall: WriteContractParameters;

    const commonParams = {
      address: SpokeAddress as `0x${string}`,
      abi: SpokeABI as Abi,
      chain: chain,
      account: address as `0x${string}`, // Added account property
    };

    switch (activeTab.toLowerCase()) {
      case "supply":
        contractCall = {
          ...commonParams,
          functionName: "depositCollateral",
          args: [assetAddress, assetAmount],
        };
        break;
      case "withdraw":
        contractCall = {
          ...commonParams,
          functionName: "withdrawCollateral",
          args: [assetAddress, assetAmount],
        };
        break;
      case "borrow":
        contractCall = {
          ...commonParams,
          functionName: "borrow",
          args: [assetAddress, assetAmount],
        };
        break;
      case "repay":
        contractCall = {
          ...commonParams,
          functionName: "repay",
          args: [assetAddress, assetAmount],
        };
        break;
      default:
        return;
    }

    setContracts([contractCall]);
  };

  useEffect(() => {
    prepareContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, activeTab, address]);

  const renderTabContent = (tabName: string) => {
    let buttonText = "";
    if (tabName === "Supply") {
      buttonText = "Supply USDC";
    } else if (tabName === "Withdraw") {
      buttonText = "Withdraw USDC";
    } else if (tabName === "Borrow") {
      buttonText = "Borrow USDC";
    } else if (tabName === "Repay") {
      buttonText = "Repay USDC";
    }

    return (
      <div className="space-y-6">
        <CurrencyDisplayer
          tokenAmount={Number.parseFloat(amount)}
          onValueChange={(usd, token) => setAmount(token.toString())}
          availableTokens={availableTokens}
          onTokenSelect={() => {}}
        />
        <div className="bg-darkBg border-2 border-main rounded-none p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-mono">Pay for Gas on</span>
            <span className="font-nupower">{chain.name || "Base"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono">Gas Estimate</span>
            <span className="font-nupower">$0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono">Time Estimate</span>
            <span className="font-nupower">~1min</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono">Relayer Fee</span>
            <span className="font-nupower">$0.99</span>
          </div>
        </div>
        <TransactionButton
          className="w-full bg-main text-darkBg hover:bg-mainAccent font-nupower text-xl py-6 rounded-none border-2 border-darkBorder shadow-light hover:translate-x-1 hover:translate-y-1 transition-all duration-300"
          text={buttonText}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-darkBg text-darkText p-6 font-neue">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-nupower text-main mb-8">Supply USDC</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-secondaryBlack border-2 border-mainAccent rounded-none shadow-[8px_8px_0px_0px_#9e66ff] p-6">
            {address ? (
              <Transaction
                chainId={chain.id}
                contracts={contracts}
                onStatus={handleOnStatus}
              >
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-darkBg border-2 border-main rounded-none p-1 mb-6">
                    {["Supply", "Withdraw", "Borrow", "Repay"].map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab.toLowerCase()}
                        className="data-[state=active]:bg-main data-[state=active]:text-darkBg rounded-none transition-all duration-300 font-nupower text-lg"
                      >
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {["supply", "withdraw", "borrow", "repay"].map((tab) => (
                    <TabsContent key={tab} value={tab}>
                      {renderTabContent(
                        tab.charAt(0).toUpperCase() + tab.slice(1),
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
                <TransactionStatus>
                  <TransactionStatusLabel />
                  <TransactionStatusAction />
                </TransactionStatus>
              </Transaction>
            ) : (
              <WalletComponent>
                <ConnectWallet>
                  <Avatar className="h-6 w-6" />
                  <Name />
                </ConnectWallet>
              </WalletComponent>
            )}
          </div>

          <div className="w-full lg:w-2/5">
            <h2 className="text-2xl sm:text-3xl font-nupower text-main mb-4 sm:mb-6">
              Transaction Details
            </h2>
            <TransactionDetails amount={amount} action={activeTab} />
          </div>
        </div>

        <div className="mt-8 bg-main p-4 rounded-none border-2 border-black">
          <h3 className="text-xl font-nupower mb-2 flex items-center text-black">
            <InfoIcon className="mr-2" />
            New to DeFi?
          </h3>
          <p className="text-sm text-black">
            DeFi (Decentralized Finance) allows you to lend, borrow, and earn
            interest on your crypto assets without traditional banks. Start
            small, learn as you go, and always research before investing.
          </p>
        </div>
      </div>
    </div>
  );
}
