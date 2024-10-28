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
import { encodeFunctionData, erc20Abi, Hex } from "viem";
import { useEffect, useState } from "react";

import { ChainSelect } from "@/components/chain-select";
import { useChainSelection } from "@/hooks/use-chain-selection";
import { tokens } from "@/utils/tokens";
import CurrencyDisplayer from "@/components/currency";
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

  ////TODO: WHAT IF THE TOKEN IS NOT SUPPORTED?
  ////TODO: WHAT IF THE CHAIN IS THE SAME AS THE SOURCE CHAIN?

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
    tokens.find((token) => token.name === selectedToken) || tokens[1];

  console.log({ contracts });
  const { data: cost, isLoading } = useReadContract({
    address: contracts.CrossChainSender as Hex,
    abi: crossChainSenderAbi,
    functionName: "quoteCrossChainDeposit",
    args: [6], //// wormhole chain id avalanche fuji
  });

  const contractCalls = [
    {
      to: tokenFind?.address as Hex, /// token address
      data: encodeFunctionData({
        abi: erc20Abi, //// approve abi
        functionName: "approve", /// approve function name
        args: [contracts.CrossChainSender as Hex, BigInt(1000000000000000000)], /// amount
      }),
    },
    // {
    //   to: contracts.CrossChainSender as Hex, /// contract address sender
    //   data: encodeFunctionData({
    //     abi: crossChainSenderAbi, /// abi
    //     functionName: "sendCrossChainDeposit", /// function name
    //     args: [
    //       contracts.wormholeChainId, ////wormhole target chain id
    //       "0xAE130Ddb73299dc029A2d2b7d6F5C9f1Fb553091" as Hex, /// contract address receiver
    //       receiver as Hex, ///// recipient
    //       BigInt(1000), ////todo: get decimals from token address
    //       tokenFind?.address as Hex,
    //     ],
    //   }),
    // },
  ];

  console.log({ tokenFind });
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

          <br />
          <ChainSelect
            value={chainId}
            onChange={(value) => {
              setChainId(value);
            }}
            chains={chains}
            label="Select Chain"
          />

          <CurrencyDisplayer
            tokenAmount={1}
            onValueChange={(value) => {
              setAmount(value);
            }}
            availableTokens={Object.fromEntries(
              Object.entries(currencyAddresses[Number(chainId)] || {}).map(
                ([key, value]) => [key, value.address]
              )
            )}
            onTokenSelect={(value) => {
              setSelectedToken(value);
            }}
            currentNetwork={Number(chainId)}
            ///TODO: add onchangenetwork here as optional
          />

          <Transaction
            chainId={Number(chainId)}
            calls={contractCalls}
            onSuccess={(response: TransactionResponse) => {
              console.log(response, "response");
            }}
            onError={(error) => {
              console.log(error);
            }}
          >
            <TransactionButton
              text={"Send"}
              //disabled={!tokenFind}
              className="bg-clr-blue text-black dark:text-black hover:bg-blue-600/80 border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none"
            />
            <TransactionStatus>
              <TransactionStatusLabel />
              <TransactionStatusAction />
            </TransactionStatus>
          </Transaction>
          <br />
          <Button
            onClick={() =>
              writeContract({
                address: contracts.CrossChainSender as Hex,
                abi: crossChainSenderAbi,
                functionName: "sendCrossChainDeposit",
                args: [
                  6, /// target chain id avalanche fuji
                  "0xAE130Ddb73299dc029A2d2b7d6F5C9f1Fb553091" as Hex, /// avalanche target contract
                  receiver as Hex,
                  BigInt(1000000), /// todo: get decimals from token address
                  tokenFind?.address as Hex,
                ],
                value: cost,
              })
            }
          >
            Transfer
          </Button>
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
