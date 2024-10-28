"use client";

import CoinBaseIdentity from "@/components/CoinBaseIdentity";
import { useParams } from "next/navigation";
import { getWormHoleContractsByNetworkName } from "@/utils/contracts";
import { crossChainSenderAbi } from "@/lib/abi/CrossChainSender"; ////abi
import {
  Transaction,
  TransactionButton,
} from "@coinbase/onchainkit/transaction";
import { encodeFunctionData, erc20Abi, Hex } from "viem";
import { useState } from "react";
function Page() {
  const params = useParams();
  const [token, setToken] = useState<string>("");
  ///// maybe put navbar in layout !!!!!!!!!!!IMPORTANT

  const contracts = getWormHoleContractsByNetworkName({
    chainId: "14",
  }); ///// need to use an use state to get the chain id UI

  const id = params.id; ///// recipient address

  const contractCalls = [
    {
      to: token as Hex, /// token address
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
          contracts.CrossChainReceiver as Hex, /// contract address receiver
          id as Hex, ///// recipient
          BigInt(1000000000000000000), ////amount
          "0x0000000000000000000000000000000000000000" as Hex, //// token address
        ],
      }),
    },
  ];

  return (
    <section className="flex flex-col justify-center items-center h-screen">
      <CoinBaseIdentity address={id as string} />
      <Transaction
        chainId={14}
        calls={contractCalls}
        // onSuccess={() => {
        //   console.log("success");
        // }}
      >
        <TransactionButton />
      </Transaction>
    </section>
  );
}

export default Page;
