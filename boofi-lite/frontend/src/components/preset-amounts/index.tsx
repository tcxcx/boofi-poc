import { Button } from "@/components/ui/button";

interface PresetAmountButtonsProps {
  onAmountSelect: (value: number) => void;
}

export default function PresetAmountButtons({ onAmountSelect }: PresetAmountButtonsProps) {
  const amounts = [5, 20, 50, 100];

  return (
    <div className="flex justify-around w-full">
      {amounts.map((amount) => (
        <Button
          key={amount}
          size="xs"
          variant="fito"
          onClick={() => onAmountSelect(amount)}
          className="w-10"
        >
          ${amount}
        </Button>
      ))}
    </div>
  );
}
