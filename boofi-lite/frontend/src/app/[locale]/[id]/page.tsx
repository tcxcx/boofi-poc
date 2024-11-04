"use client";

import CoinBaseIdentity from "@/components/CoinBaseIdentity";
import { useParams } from "next/navigation";
import { getWormHoleContractsByNetworkName } from "@/utils/contracts";
import { crossChainSenderAbi } from "@/lib/abi/CrossChainSender"; ////abi
import {
  Transaction,
  TransactionButton,
  TransactionResponse,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";
import { erc20Abi, Hex } from "viem";
import { useEffect, useState } from "react";

import { ChainSelect } from "@/components/chain-select";
import { useChainSelection } from "@/hooks/use-chain-selection";
import { getTokensByChainId, testnetTokensByChainId } from "@/utils/tokens";

import { chains } from "@/utils/contracts";
import { Button } from "@/components/ui/button";
import { getAddress } from "@coinbase/onchainkit/identity";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Skeleton } from "@/components/ui/skeleton";
import { TokenChip } from "@coinbase/onchainkit/token";
import CurrencyDisplayerPay from "@/components/currency-pay";
interface WormholeContracts {
  CrossChainSender: string;
  wormholeChainId: number;
}
function Page() {
  const params = useParams();
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [receiver, setReceiver] = useState<string>("");
  const [chainId, setChainId] = useState<string>("84532");
  const [ensNotFound, setEnsNotFound] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { toChain } = useChainSelection();
  const { writeContract, error, data, isIdle, isError } = useWriteContract();
  const id = params.id; ///// recipient address
  const address = useAccount();

  ////TODO: WHAT IF THE TOKEN IS NOT SUPPORTED?
  ////TODO: WHAT IF THE CHAIN IS THE SAME AS THE SOURCE CHAIN?
  const targetContract = "0x84f597AEcC19925070974c8EeDAa38E535430c5e"; //// target contract address in avalanche fuji
  async function getEnsAddress() {
    setLoading(true);
    try {
      const address = await getAddress({
        name: id as string,
      });
      console.log({ address });

      setEnsNotFound(address === null);

      setReceiver(address as Hex);
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
    args: [6], //// wormhole chain id avalanche fuji
  });

  console.log({ cost, isLoading, status });
  const { data: approveCost } = useReadContract({
    address: selectedToken as Hex,
    abi: erc20Abi,
    functionName: "allowance",
    args: [
      (address.address as Hex) || "0x0",
      contracts.CrossChainSender as Hex,
    ],
  });

  console.log({ approveCost });

  const sameTargetChain = chainId === "43113";

  if (loading) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <main className="h-screen">
      {!ensNotFound && (
        <section className="flex flex-col justify-center items-center w-10/12 m-auto h-screen">
          {receiver && (
            <CoinBaseIdentity address={receiver as Hex} label="Recipient" />
          )}

          <ChainSelect
            value={chainId}
            onChange={(value) => {
              setSelectedToken("");
              setChainId(value);
            }}
            chains={chains}
            label="Select Chain"
          />

          <CurrencyDisplayerPay
            tokenAmount={1}
            onValueChange={(value) => {
              setAmount(value);
            }}
            availableTokens={testnetTokensByChainId(Number(chainId))}
            onTokenSelect={(value) => {
              setSelectedToken(value);
            }}
            currentNetwork={Number(chainId)}
            currentToken={selectedToken}
          />

          <br />
          {!sameTargetChain && (
            <>
              {testnetTokensByChainId(Number(chainId))?.map((token) => (
                <TokenChip
                  token={token}
                  onClick={() =>
                    writeContract({
                      address: selectedToken as Hex,
                      abi: erc20Abi,
                      functionName: "approve",
                      args: [
                        contracts.CrossChainSender as Hex,
                        BigInt(1000000000000000000),
                      ],
                    })
                  }
                />
              ))}
            </>
          )}

          {approveCost && <p>Approval Cost: {approveCost}</p>}

          {!sameTargetChain && (
            <Button
              onClick={() =>
                writeContract({
                  address: contracts.CrossChainSender as Hex,
                  value: cost,
                  abi: crossChainSenderAbi,
                  functionName: "sendCrossChainDeposit",
                  args: [
                    6,
                    targetContract as Hex,
                    receiver as Hex,
                    BigInt(1000000),
                    selectedToken as Hex,
                  ],
                })
              }
            >
              Send Tokens
            </Button>
          )}

          {sameTargetChain && (
            <Button
              onClick={() =>
                writeContract({
                  address: tokenFind.address as Hex,
                  abi: erc20Abi,
                  functionName: "transfer",
                  args: [receiver as Hex, BigInt(1000000)],
                })
              }
            >
              Send Tokens
            </Button>
          )}
        </section>
      )}
      {ensNotFound && (
        <section className="flex flex-col justify-center items-center w-10/12 m-auto">
          <h1>ENS NOT FOUND</h1>
        </section>
      )}
    </main>
  );
}

export default Page;
