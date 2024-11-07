import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { truncateAddress } from "@/utils/truncateAddress";

export const SendToInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  return (
    <div className="flex items-center gap-2 w-full max-w-sm pt-4">
      <Label htmlFor="address" className="whitespace-nowrap">
        Send to:
      </Label>
      <Input
        type="text"
        id="address"
        placeholder="0xVitalik...123"
        value={truncateAddress(value)}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
