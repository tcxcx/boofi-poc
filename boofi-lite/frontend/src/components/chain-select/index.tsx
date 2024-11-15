import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChainSelectProps, Token } from "@/lib/types";
import { useGetTokenOrChainById } from "@/hooks/use-get-token-or-chain-by-id";

export const ChainSelect: React.FC<ChainSelectProps> = ({
  value,
  onChange,
  chains,
  label,
}) => {
  const renderChainOption = (chainId: string | number) => {
    const chain = chains.find((c) => c.chainId === Number(chainId));
    const tokens = useGetTokenOrChainById(Number(chainId), "token") as Token[];
    const baseToken = tokens[0];

    if (!chain) {
      return null;
    }

    return (
      <div className="flex items-center space-x-2">
        <img
          src={baseToken?.image || ""}
          alt={baseToken?.symbol || ""}
          className="h-6 w-6 rounded-full"
        />
        <span className="font-clash text-sm">{chain.name}</span>
      </div>
    );
  };

  return (
    <div className="flex-1 flex items-center space-x-2 m-auto gap-4 justify-around">
      {!value && (
        <span className="text-xs text-gray-500 uppercase ">{label}</span>
      )}
      <div className=" min-w-[230px] w-[230px] max-w-[230px] m-auto">
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger className="w-full m-auto flex items-center">
            <SelectValue placeholder={label} className="m-auto">
              {value ? renderChainOption(value) : label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {chains.map((chain) => (
              <SelectItem
                key={chain.chainId}
                value={chain.chainId.toString()}
                className="m-auto"
              >
                {renderChainOption(chain.chainId.toString())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
