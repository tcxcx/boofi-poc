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
import { useCallback, useState } from "react";
import { Select } from "@/components/ui/select";
import NetworkSelector from "@/components/chain-network-select";
import { ChainSelect } from "@/components/chain-select";
import { useChainSelection } from "@/hooks/use-chain-selection";
import { Token, TokenChip, TokenSearch } from "@coinbase/onchainkit/token";
import { getTokens } from "@coinbase/onchainkit/api";

function Page() {
  const params = useParams();
  const [token, setToken] = useState<string>("");
  const [tokens, setTokens] = useState<Token[]>([]);

  const [searchToken, setSearchToken] = useState<string[]>([]);
  const [chainId, setChainId] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  const {
    currentViewTab,
    fromChain,
    toChain,
    setFromChain,
    setToChain,
    fromChains,
    toChains,
  } = useChainSelection();
  ///// maybe put navbar in layout !!!!!!!!!!!IMPORTANT

  const contracts = getWormHoleContractsByNetworkName({
    chainId: "14",
  }); ///// need to use an use state to get the chain id UI
  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setTokens([]);
  };

  const handleChange = useCallback((value: string) => {
    async function getData(value: string) {
      const response = await getTokens({ search: value });
      setTokens(response as Token[]);
      console.log(response);
      if ("tokens" in response) {
        console.log(response);
      } else {
        console.error("Error fetching tokens:", response);
      }
    }
    getData(value);
  }, []);
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
      <section className=" m-auto flex flex-col items-center justify-center">
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
      </section>
      <ChainSelect
        value={toChain}
        onChange={setToChain}
        chains={toChains}
        label="Select Chain"
      />
    </section>
  );
}

export default Page;
