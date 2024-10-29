import { Button } from "@/components/ui/button";

interface PresetAmountButtonsProps {
  onAmountSelect: (value: number) => void;
}

export default function PresetAmountButtons({ onAmountSelect }: PresetAmountButtonsProps) {
  const amounts = [5, 20, 50, 100];

  return (
    <div className="flex justify-around w-full space-x-2">
      {amounts.map((amount) => (
        <Button
          key={amount}
          variant="charly"
          onClick={() => onAmountSelect(amount)}
          className="w-20"
        >
          ${amount}
        </Button>
      ))}
    </div>
  );
}
