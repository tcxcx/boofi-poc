import { Button } from "@/components/ui/button";
import { base } from "wagmi/chains";
import { useDeezNuts } from "@/hooks/use-peanut";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import confetti from "canvas-confetti";
export const handleConfetti = (
  text: string,
  label: string,
  emoji: string,
  toastTitle: string,
  toastDescription: string,
  handleCopy?: (text: string) => void
) => {
  handleCopy?.(text);

  const scalar = 4;
  if (emoji && text !== "") {
    const unicorn = confetti.shapeFromText({ text: emoji, scalar });

    const defaults = {
      spread: 360,
      ticks: 60,
      gravity: 0,
      decay: 0.96,
      startVelocity: 20,
      shapes: [unicorn],
      scalar,
    };

    const shoot = () => {
      confetti({ ...defaults, particleCount: 30 });
      confetti({ ...defaults, particleCount: 5 });
      confetti({
        ...defaults,
        particleCount: 15,
        scalar: scalar / 2,
        shapes: ["circle"],
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  }
  toast({
    title: toastTitle,
    description: toastDescription,
  });
};
