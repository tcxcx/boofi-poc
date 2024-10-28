import { Avatar, Identity, Name, Badge } from "@coinbase/onchainkit/identity";
import { Button } from "@/components/ui/button";
import { base } from "wagmi/chains";
import { useDeezNuts } from "@/hooks/use-peanut";
import { Skeleton } from "../ui/skeleton";
import { toast } from "../ui/use-toast";
import confetti from "canvas-confetti";

export default function CoinBaseIdentity({
  address,
}: {
  address: string | undefined;
}) {
  const { truncateHash, copyToClipboard } = useDeezNuts();
  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text);

    const scalar = 4;
    const unicorn = confetti.shapeFromText({ text: "💸👻💸", scalar });

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

    toast({
      title: "Copied to clipboard!",
      description: `${label} has been copied to clipboard.`,
    });
  };

  return (
    <div className="m-auto w-full text-nowrap rounded-3xl">
      <Identity
        className="rounded-3xl bg-white m-auto flex flex-row items-center justify-center p-4"
        address={address as `0x${string}`}
        chain={base}
        schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
      >
        <Avatar
          loadingComponent={<Skeleton />}
          defaultComponent={
            <div className="h-8 w-8">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon
                  points="6,1 14,1 19,6 19,14 14,19 6,19 1,14 1,6"
                  fill="green"
                  stroke="green"
                  stroke-width="1"
                />
              </svg>
            </div>
          }
        />
        <Name>
          <Badge />
        </Name>
        <Button
          size="sm"
          variant="link"
          onClick={() => handleCopy(address || "", "Address")}
        >
          {truncateHash(address)}
        </Button>
      </Identity>
    </div>
  );
}
