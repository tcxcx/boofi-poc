import { Avatar, Identity, Name, Badge } from "@coinbase/onchainkit/identity";
import { Button } from "@/components/ui/button";
import { base } from "wagmi/chains";
import { useDeezNuts } from "@/hooks/use-peanut";
import { Skeleton } from "../ui/skeleton";
import { handleConfetti } from "@/utils/confetti";

export default function CoinBaseIdentity({
  address,
  label,
}: {
  address: string | undefined;
  label?: string;
}) {
  const { truncateHash, copyToClipboard } = useDeezNuts();

  return (
    <div
      className=" w-full text-nowrap rounded-3xl m-auto flex flex-row items-center justify-center p-4 gap-2"
      onClick={() =>
        handleConfetti(
          address || "",
          "Address",
          "",
          "Copied to clipboard!",
          `${label} has been copied to clipboard.`,
          copyToClipboard
        )
      }
    >
      {label && <p className="text-sm text-gray-500">{label}</p>}
      <Identity
        className="rounded-3xl flex flex-row items-center justify-center p-4"
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
        <Button size="sm" variant="link">
          {truncateHash(address)}
        </Button>
      </Identity>
    </div>
  );
}
