import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBaseTokenByChainId } from "@/lib/utils";
import { ChainSelectProps } from "@/lib/types";

export const ChainSelect: React.FC<ChainSelectProps> = ({
  value,
  onChange,
  chains,
  label,
}) => {
  const renderChainOption = (chainId: string | number) => {
    const chain = chains.find((c) => c.chainId === Number(chainId));
    const baseToken = getBaseTokenByChainId(Number(chainId));

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
    <div className="flex-1 flex items-center space-x-2">
      <span className="text-xs text-gray-500 uppercase">{label}</span>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className="w-auto flex items-center">
          <SelectValue placeholder={label}>
            {value ? renderChainOption(value) : label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {chains.map((chain) => (
            <SelectItem key={chain.chainId} value={chain.chainId.toString()}>
              {renderChainOption(chain.chainId.toString())}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
