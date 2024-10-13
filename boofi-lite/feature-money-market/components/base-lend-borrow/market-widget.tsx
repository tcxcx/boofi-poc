import {
  TokenChip,
  TokenImage,
  formatAmount,
} from "@coinbase/onchainkit/token";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type React from "react";
import { useState } from "react";

const MarketWidget = () => {
  const [amount, setAmount] = useState("0");
  const [supplyFrom, setSupplyFrom] = useState("arbitrum");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const formattedAmount = formatAmount(amount, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

  const networks = [
    {
      value: "arbitrum",
      name: "Arbitrum",
      chainId: 42161,
    },
    {
      value: "ethereum",
      name: "Ethereum",
      chainId: 1,
    },
  ];

  return (
    <div className="bg-[#1c1c1c] rounded-xl p-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <Select value={supplyFrom} onValueChange={setSupplyFrom}>
          <SelectTrigger className="w-full sm:w-[160px] bg-transparent border-none text-white">
            <SelectValue placeholder="Supply from" />
          </SelectTrigger>
          <SelectContent className="bg-[#2c2c2c] border-none">
            {networks.map((network) => (
              <SelectItem key={network.value} value={network.value}>
                <div className="flex items-center">
                  <TokenImage
                    token={{
                      name: network.name,
                      address: "0x0000000000000000000000000000000000000000",
                      symbol: network.name,
                      decimals: 18,
                      image: null,
                      chainId: network.chainId,
                    }}
                    size={24}
                  />
                  <span className="ml-2">{network.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center text-white">
          <span className="mr-2">Supply to:</span>
          <div className="flex items-center bg-[#2c2c2c] px-3 py-2 rounded-md">
            <TokenImage
              token={{
                name: "CCTP",
                address: "0x0000000000000000000000000000000000000000",
                symbol: "CCTP",
                decimals: 18,
                image: "/icons/circle-ccip.png",
                chainId: 0,
              }}
              size={24}
            />
            <span className="ml-2">CCTP</span>
          </div>
        </div>
      </div>
      <div className="relative mt-4 bg-[#2c2c2c] rounded-xl p-4">
        <div className="flex justify-between items-center">
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="w-full bg-transparent border-none text-white text-2xl sm:text-4xl font-bold focus:outline-none"
            placeholder="0"
          />
          <div className="flex items-center">
            <TokenImage
              token={{
                name: "USDC",
                address: "0x0000000000000000000000000000000000000000",
                symbol: "USDC",
                decimals: 6,
                image: "/USDC_Icon.png",
                chainId: 1,
              }}
              size={24}
            />
            <span className="text-white text-xl sm:text-2xl font-bold ml-2">
              USDC
            </span>
          </div>
        </div>
        <div className="text-gray-400 mt-2">${formattedAmount}</div>
      </div>
    </div>
  );
};

export default MarketWidget;
