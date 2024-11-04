// frontend/src/components/forms/send.tsx

'use client';

import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { SendToInput } from "@/components/send-to-input/index";
import { Button } from "@/components/ui/button";
import { ChainSelect } from "@/components/chain-select";
import CurrencyDisplayer from "@/components/currency";
import PresetAmountButtons from "@/components/preset-amounts";
import { Skeleton } from "@/components/ui/skeleton";
import { getWormHoleContractsByNetworkName } from "@/utils/contracts";
import { tokens } from "@/utils/tokens";
import { encodeFunctionData, erc20Abi, Hex } from "viem";
import { crossChainSenderAbi } from "@/lib/abi/CrossChainSender";
import { currencyAddresses } from "@/utils/currencyAddresses";
import { chains } from "@/utils/contracts";
import {
  Transaction,
  TransactionButton,
  TransactionResponse,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";
import MultiChainToggle from "@/components/multichain-toggle";
import ChainSelectSkeleton from "@/components/forms/send/skeletons/chain-select-skeleton";
import CurrencyDisplayerSkeleton from "@/components/forms/send/skeletons/currency-displayer-skeleton";
import TransactionSectionSkeleton from "@/components/forms/send/skeletons/transaction-section-skeleton";

export default function SendPayment() {
  const [selectedToken, setSelectedToken] = useState<string>("ETH");
  const [amount, setAmount] = useState<number>(0);
  const [receiver, setReceiver] = useState<string>("");
  const [chainId, setChainId] = useState<string>("84532");
  const [isMultiChain, setIsMultiChain] = useState(false);
  const [destinationChainId, setDestinationChainId] = useState<string>("");

  const { writeContract } = useWriteContract();
  const { toast } = useToast();
  const { address } = useAccount();

  const contracts = getWormHoleContractsByNetworkName({
    chainId: chainId,
  });

  const tokenFind = tokens.find((token) => token.name === selectedToken) || tokens[1];

  const { data: cost, isLoading: isCostLoading, error: costError } = useReadContract({
    address: contracts.CrossChainSender as Hex,
    abi: crossChainSenderAbi,
    functionName: "quoteCrossChainDeposit",
    args: [6],
  });

  const contractCalls = [
    {
      to: tokenFind?.address as Hex,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [contracts.CrossChainSender as Hex, BigInt(1000000000000000000)],
      }),
    },
  ];

  function handleAmountSelect(selectedAmount: number) {
    setAmount(selectedAmount);
  }

  return (
    <div className="flex flex-col items-center w-full p-4">
      <div className="flex flex-col w-full max-w-2xl space-y-6">
        <div className="flex w-full h-auto flex-col justify-between rounded-2xl border bg-background p-4">
          {/* Preset Amount Buttons */}
          <PresetAmountButtons onAmountSelect={handleAmountSelect} />

          {/* Chain Selector */}
          <div className="flex justify-center w-full my-4 ">
            <div className="text-center">
              {chains.length > 0 ? (
                <ChainSelect
                  value={chainId}
                  onChange={(value) => setChainId(value)}
                  chains={chains}
                  label="Select Chain"
                />
              ) : (
                <ChainSelectSkeleton />
              )}

              {/* Recipient Input */}
              <SendToInput
                value={receiver}
                onChange={(address: string) => setReceiver(address)}
                label="Recipient Address"
              />
            </div>
          </div>

          {/* Multi-Chain Toggle */}
          <MultiChainToggle
            isMultiChain={isMultiChain}
            setIsMultiChain={setIsMultiChain}
            currentChainId={chainId}
            onSelect={(chainId: string) => setDestinationChainId(chainId)}
          />

          {/* Currency Displayer */}
          {isCostLoading ? (
            <CurrencyDisplayerSkeleton />
          ) : (
            <CurrencyDisplayer
              tokenAmount={amount}
              onValueChange={(newAmount) => setAmount(newAmount)}
              availableTokens={Object.fromEntries(
                Object.entries(currencyAddresses[Number(chainId)] || {}).map(([key, value]) => [
                  key,
                  value.address,
                ])
              )}
              onTokenSelect={(value) => setSelectedToken(value)}
              currentNetwork={Number(chainId)}
            />
          )}

          {/* Transaction Section */}
          {isCostLoading ? (
            <TransactionSectionSkeleton />
          ) : (
            <div className="flex flex-col w-full space-y-2 pt-4">
              <Transaction
                chainId={Number(chainId)}
                calls={contractCalls}
                onSuccess={(response: TransactionResponse) =>
                  toast({
                    title: "Transaction Successful",
                    description: `Transaction hash: ${response.transactionReceipts[0].transactionHash}`,
                  })
                }
                onError={(error) =>
                  toast({
                    title: "Transaction Failed",
                    description: error.message || "An error occurred.",
                  })
                }
              >
                <TransactionButton
                  text="Send"
                  className="w-full bg-clr-blue text-black dark:text-black hover:bg-blue-600/80 border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark"
                />
                <TransactionStatus>
                  <TransactionStatusLabel />
                  <TransactionStatusAction />
                </TransactionStatus>
              </Transaction>

              <Button
                onClick={() => {
                  if (!receiver) {
                    toast({
                      title: "No Recipient",
                      description: "Please enter a recipient address or name.",
                    });
                    return;
                  }
                  writeContract({
                    address: contracts.CrossChainSender as Hex,
                    abi: crossChainSenderAbi,
                    functionName: "sendCrossChainDeposit",
                    args: [
                      6,
                      "0xAE130Ddb73299dc029A2d2b7d6F5C9f1Fb553091" as Hex, // Replace with actual sender address if necessary
                      receiver as Hex,
                      BigInt(amount),
                      tokenFind?.address as Hex,
                    ],
                    value: cost,
                  });
                }}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                Transfer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
