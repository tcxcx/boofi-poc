"use client";

import CoinBaseIdentity from "@/components/CoinBaseIdentity";
import { useParams } from "next/navigation";
import {
  getWormHoleContractsByNetworkName,
  wormholeContractAddress,
} from "@/utils/contracts";
import { crossChainSenderAbi } from "@/lib/abi/CrossChainSender";
import {
  Transaction,
  TransactionButton,
  TransactionResponse,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";
import { erc20Abi, Hex, encodeFunctionData } from "viem";
import { useEffect, useState } from "react";
import { ChainSelect } from "@/components/chain-select";
import PresetAmountButtons from "@/components/preset-amounts/index";

import { useChainSelection } from "@/hooks/use-chain-selection";
import { getTokensByChainId, testnetTokensByChainId } from "@/utils/tokens";
import { chains } from "@/utils/contracts";
import { Button } from "@/components/ui/button";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Skeleton } from "@/components/ui/skeleton";
import CurrencyDisplayerPay from "@/components/currency-pay";
import { getAddress } from "@coinbase/onchainkit/identity";
import { tokenBridge } from "@/components/wormhole/index";
import { useEthersSigner } from "@/lib/wagmi/wagmi";

interface WormholeContracts {
  CrossChainSender: string;
  wormholeChainId: number;
}

export default function PayId() {
  const params = useParams();
  const [selectedToken, setSelectedToken] = useState<string>("ETH");
  const [amount, setAmount] = useState<number>(1);
  const [receiver, setReceiver] = useState<string>("");
  const [chainId, setChainId] = useState<string>("84532");
  const [ensNotFound, setEnsNotFound] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { toChain } = useChainSelection();
  const { writeContract, error, data, isIdle, isError } = useWriteContract();
  const id = params.id; ///// recipient address
  const address = useAccount();
  const signer = useEthersSigner();

  ////TODO: WHAT IF THE TOKEN IS NOT SUPPORTED?
  ////TODO: WHAT IF THE CHAIN IS THE SAME AS THE SOURCE CHAIN?
  const targetContract = "0x84f597AEcC19925070974c8EeDAa38E535430c5e"; //// target contract address in avalanche fuji

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

  const tokenFind =
    getTokensByChainId({ chainId: chainId }).find(
      (token) => token.name === selectedToken
    ) || getTokensByChainId({ chainId: chainId })[1];

  const {
    data: cost,
    isLoading,
    status,
  } = useReadContract({
    address: contracts.CrossChainSender as Hex,
    abi: crossChainSenderAbi,
    functionName: "quoteCrossChainDeposit",
    args: [6],
  });

  const sameTargetChain = chainId === "43113";

  if (loading) return <Skeleton className="w-full h-full" />;

  function handleAmountSelect(amount: number) {
    setAmount(amount);
  }

  const handleSwap = async (
    value: number
    // sourceChain: "BaseSepolia" | "OptimismSepolia"
  ) => {
    setLoading(true);

    if (address.address) {
      try {
        await tokenBridge(value, address.address);
        // } else {
        //   await tokenBridgeReverse(
        //     value,
        //     anchorWallet,
        //     walletContext.wallet,
        //     address,
        //     getBridgeConnection()
        //   );
        // }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className="flex flex-col items-center w-full p-4">
      <div className="flex flex-col w-full max-w-l">
        {!ensNotFound ? (
          <>
            {receiver && (
              <CoinBaseIdentity address={receiver as Hex} label="Recipient" />
            )}
            <div className="flex justify-center space-x-2">
              <PresetAmountButtons onAmountSelect={handleAmountSelect} />
            </div>

            <div className="flex justify-center w-full my-4">
              <div className="text-center">
                <ChainSelect
                  value={chainId}
                  onChange={(value) => {
                    setSelectedToken("");
                    setChainId(value);
                  }}
                  chains={chains}
                  label="Select Chain"
                />
              </div>
            </div>

            <CurrencyDisplayerPay
              tokenAmount={amount}
              onValueChange={(value) => setAmount(value)}
              availableTokens={testnetTokensByChainId(Number(chainId))}
              onTokenSelect={(value) => setSelectedToken(value)}
              currentNetwork={Number(chainId)}
              currentToken={selectedToken}
            />

            <div className="flex flex-col w-full space-y-2 pt-4">
              {sameTargetChain ? (
                <>
                  <Transaction
                    chainId={Number(chainId)}
                    calls={[
                      {
                        to: "0x5425890298aed601595a70AB815c96711a31Bc65" as Hex,
                        data: encodeFunctionData({
                          abi: erc20Abi,
                          functionName: "approve",
                          args: [
                            contracts.CrossChainSender as Hex,
                            BigInt(1000000000000000000),
                          ],

                        }),
                      },
                    ]}
                    onSuccess={(response: TransactionResponse) =>
                      console.log(response, "response")
                    }
                    onError={(error) => console.log(error)}
                  >
                    <TransactionButton
                      text="Approve"
                      className="w-full bg-clr-blue text-black dark:text-black hover:bg-blue-600/80 border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark"
                    />
                    <TransactionStatus>
                      <TransactionStatusLabel />
                      <TransactionStatusAction />
                    </TransactionStatus>
                  </Transaction>

                  <Button
                    onClick={() => handleSwap(amount)}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    Transfer
                  </Button>
                </>
              ) : (
                <Button
                  onClick={
                    () => handleSwap(amount)
                    //   writeContract({
                    //     address: tokenFind.address as Hex,
                    //     abi: erc20Abi,
                    //     functionName: "transfer",
                    //     args: [receiver as Hex, BigInt(1000000)],
                    //   })
                  }
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Send Tokens
                </Button>
              )}
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
