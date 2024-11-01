"use client";

import { Icons } from "@midday/ui/icons";
import { Name } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";

export default function ChatEmpty() {
  const { address } = useAccount();

  return (
    <div className="w-full mt-[200px] todesktop:mt-24 md:mt-24 flex flex-col items-center justify-center text-center">
      <Icons.LogoSmall />
      <span className="font-medium text-xl mt-6">
        Hi <Name address={address} />, how can I help <br />
        you today?
      </span>
    </div>
  );
}
