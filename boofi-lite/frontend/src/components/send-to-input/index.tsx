import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function truncateAddress(address: string, length: number = 6): string {
  if (!address) return '';
  return address.length > 2 * length + 2
    ? `${address.slice(0, length)}...${address.slice(-length)}`
    : address;
}

export const SendToInput: React.FC<{ value: string; onChange: (value: string) => void; label: string }> = ({
  value,
  onChange,
  label,
}) => {
  return (
    <div className="flex items-center gap-2 w-full max-w-sm pt-4">
      <Label htmlFor="address" className="whitespace-nowrap">Send to:</Label>
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
