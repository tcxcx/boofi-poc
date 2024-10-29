"use client";

import CoinBaseIdentity from "@/components/CoinBaseIdentity";
import { useParams } from "next/navigation";
import { getWormHoleContractsByNetworkName } from "@/utils/contracts";
import { crossChainSenderAbi } from "@/lib/abi/CrossChainSender";
import {
  Transaction,
  TransactionButton,
  TransactionResponse,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";
import { encodeFunctionData, erc20Abi, Hex } from "viem";
import { useEffect, useState } from "react";
import { ChainSelect } from "@/components/chain-select";
import { tokens } from "@/utils/tokens";
import CurrencyDisplayer from "@/components/currency";
import PresetAmountButtons from "@/components/preset-amounts";
import { currencyAddresses } from "@/utils/currencyAddresses";
import { chains } from "@/utils/contracts";
import { Button } from "@/components/ui/button";
import { getAddress } from "@coinbase/onchainkit/identity";
import { useReadContract, useWriteContract } from "wagmi";
import { Skeleton } from "@/components/ui/skeleton";

interface WormholeContracts {
  CrossChainSender: string;
  wormholeChainId: number;
}

export default function PayId() {
  const params = useParams();
  const [selectedToken, setSelectedToken] = useState<string>("ETH");
  const [amount, setAmount] = useState<number>(0);
  const [receiver, setReceiver] = useState<string>("");
  const [chainId, setChainId] = useState<string>("84532");
  const [ensNotFound, setEnsNotFound] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { writeContract } = useWriteContract();
  const id = params.id; // recipient address

  async function getEnsAddress() {
    setLoading(true);
    try {
      const address = await getAddress({ name: id as string });
      setReceiver(address as Hex);
      setEnsNotFound(!address);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getEnsAddress();
  }, []);

  const contracts: WormholeContracts = getWormHoleContractsByNetworkName({
    chainId: chainId,
  });

  const tokenFind = tokens.find((token) => token.name === selectedToken) || tokens[1];

  const { data: cost, isLoading } = useReadContract({
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

  if (loading) return <Skeleton className="w-full h-full" />;

  function handleAmountSelect(amount: number) {
    setAmount(amount);
  }

  return (
    <div className="flex flex-col items-center w-full p-4">
      <div className="flex flex-col w-full max-w-lg p-6 space-y-6 rounded-2xl border bg-background shadow-lg">
        {/* Header Section */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-xl">💸👻💸</span>
          <span className="text-right">You are sending</span>
        </div>

        {!ensNotFound ? (
          <>
            {receiver && (
                <CoinBaseIdentity address={receiver as Hex} label="Recipient" />
            )}

            {/* Centered Chain Selector */}
            <div className="flex justify-center w-full my-4">
              <div className="text-center">
                <span className="block text-xs font-semibold mb-2">Select Chain</span>
                <ChainSelect
                  value={chainId}
                  onChange={(value) => setChainId(value)}
                  chains={chains}
                  label="Select Chain"
                />
              </div>
            </div>

            {/* Preset Amount Buttons */}
            <div className="flex justify-center space-x-2">
              <PresetAmountButtons onAmountSelect={handleAmountSelect} />
            </div>

            {/* Currency Displayer */}
            <CurrencyDisplayer
              tokenAmount={amount}
              onValueChange={(value) => setAmount(value)}
              availableTokens={Object.fromEntries(
                Object.entries(currencyAddresses[Number(chainId)] || {}).map(([key, value]) => [
                  key,
                  value.address,
                ])
              )}
              onTokenSelect={(value) => setSelectedToken(value)}
              currentNetwork={Number(chainId)}
            />

            {/* Transaction Section */}
            <div className="flex flex-col w-full space-y-2">
              <Transaction
                chainId={Number(chainId)}
                calls={contractCalls}
                onSuccess={(response: TransactionResponse) => console.log(response, "response")}
                onError={(error) => console.log(error)}
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
                onClick={() =>
                  writeContract({
                    address: contracts.CrossChainSender as Hex,
                    abi: crossChainSenderAbi,
                    functionName: "sendCrossChainDeposit",
                    args: [
                      6,
                      "0xAE130Ddb73299dc029A2d2b7d6F5C9f1Fb553091" as Hex,
                      receiver as Hex,
                      BigInt(1000000),
                      tokenFind?.address as Hex,
                    ],
                    value: cost,
                  })
                }
                className="w-full bg-green-500 hover:bg-green-600"
              >
                Transfer
              </Button>
            </div>
          </>
        ) : (
          <section className="flex flex-col items-center justify-center w-full">
            <h1 className="text-xl font-bold">ENS NOT FOUND</h1>
          </section>
        )}
      </div>
    </div>
  );
}
