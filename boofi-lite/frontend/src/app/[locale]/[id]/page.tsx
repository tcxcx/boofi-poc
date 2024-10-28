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
import { useCallback, useState } from "react";

import { ChainSelect } from "@/components/chain-select";
import { useChainSelection } from "@/hooks/use-chain-selection";
import { Token, TokenChip, TokenSearch } from "@coinbase/onchainkit/token";
import { tokens } from "@/utils/tokens";
import CurrencyDisplayer from "@/components/currency";
import { currencyAddresses } from "@/utils/currencyAddresses";
import { chains } from "@/utils/contracts";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { useReadContract, useWriteContract } from "wagmi";
import { readContract } from "viem/actions";
interface WormholeContracts {
  CrossChainSender: string;
  wormholeChainId: number;
}
function Page() {
  const params = useParams();
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [chainId, setChainId] = useState<string>("84532");
  const { toChain } = useChainSelection();
  const { writeContract, error, data, isIdle, isError } = useWriteContract();

  const contracts: WormholeContracts = getWormHoleContractsByNetworkName({
    chainId: chainId,
  }); ///// need to use an use state to get the chain id UI
  //   const handleTokenSelect = (token: Token) => {
  //     setSelectedToken(token);
  //     setTokens([]);
  //   };

  //   const handleChange = useCallback((value: string) => {
  //     async function getData(value: string) {
  //       const response = await getTokens({ search: value });
  //       setTokens(response as Token[]);
  //       console.log(response);
  //       if ("tokens" in response) {
  //         console.log(response);
  //       } else {
  //         console.error("Error fetching tokens:", response);
  //       }
  //     }
  //     getData(value);
  //   }, []);
  const id = params.id; ///// recipient address
  console.log(contracts, "contracts");
  const tokenFind =
    tokens.find((token) => token.name === selectedToken) || tokens[1];

  const {
    data: cost,
    error: costError,
    isFetched,
    status,
  } = useReadContract({
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
    {
      to: contracts.CrossChainSender as Hex, /// contract address sender
      data: encodeFunctionData({
        abi: crossChainSenderAbi, /// abi
        functionName: "sendCrossChainDeposit", /// function name
        args: [
          contracts.wormholeChainId, ////wormhole target chain id
          "0xe4B5De5eA97C34F784E622DE94e5Db8a3b359196" as Hex, /// contract address receiver
          id as Hex, ///// recipient
          BigInt(1000), ////todo: get decimals from token address
          tokenFind?.address as Hex,
        ],
      }),
    },
  ];

  return (
    <section className="flex flex-col justify-center items-center ">
      <CoinBaseIdentity address={id as string} />
      {/* <section className=" m-auto flex flex-col items-center justify-center">
        <TokenSearch onChange={handleChange} delayMs={100} className="w-full" />
        <div className="flex flex-col items-center justify-center w-5/12 md:w-full sm:w-full">
          {tokens.length > 0 && (
            <ul className="mt-4 max-h-80 overflow-y-auto flex flex-col gap-2 justify-center items-center bg-[#e4e7eb] p-4 rounded-3xl w-full">
              {tokens.map((token) => (
                <li
                  key={token.address}
                  className="cursor-pointer font-bold w-full"
                  onClick={() => handleTokenSelect(token)}
                >
                  <TokenChip
                    className="m-auto w-full items-center justify-center flex"
                    token={token}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section> */}

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
        // onError={onError}
        onSuccess={(response: TransactionResponse) => {
          //   const transactionHash =
          //     response?.transactionReceipts?.[0]?.transactionHash;
          //   if (transactionHash) {
          //     onSuccess(transactionHash);
          //   }
          console.log(response, "response");
        }}
        onError={(error) => {
          console.log(error);
        }}
      >
        <TransactionButton
          text={"Send"}
          disabled={!tokenFind}
          className="bg-clr-blue text-black dark:text-black hover:bg-blue-600/80 border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none"
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
              6, /// target chain id avalanche fuji
              "0xAE130Ddb73299dc029A2d2b7d6F5C9f1Fb553091" as Hex,
              id as Hex,
              BigInt(1000000),
              tokenFind?.address as Hex,
            ],
            value: cost,
          })
        }
      >
        Transfer
      </Button>
    </section>
  );
}

export default Page;
