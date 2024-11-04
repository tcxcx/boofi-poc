import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import NetworkSelector from "@/components/chain-network-select";
import { NetworkSelectorProps } from "@/lib/types";

interface MultiChainToggleProps extends NetworkSelectorProps {
  isMultiChain: boolean;
  setIsMultiChain: (value: boolean) => void;
}

const MultiChainToggle: React.FC<MultiChainToggleProps> = ({
  isMultiChain,
  setIsMultiChain,
  currentChainId,
  onSelect,
}) => {
  return (
    <>
      <div className="flex items-center justify-end p-4 space-x-2">
        <Switch
          id="multi-chain-toggle"
          checked={isMultiChain}
          onCheckedChange={() => setIsMultiChain(!isMultiChain)}
        />
        <Label htmlFor="multi-chain-toggle" className="text-xs">
          Multi-Chain destiny? <span className="text-xl">🧑‍🚀</span>
        </Label>
      </div>

      {isMultiChain && (
        <NetworkSelector
          currentChainId={currentChainId}
          onSelect={onSelect}
        />
      )}
    </>
  );
};

export default MultiChainToggle;
