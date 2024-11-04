import React from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const SendToInput: React.FC<{ value: string; onChange: (value: string) => void; label: string }> = ({
  value,
  onChange,
  label,
}) => {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="address">Address</Label>
      <Input type="address" id="address" placeholder="0xVitalik" />
    </div>
  );
};
