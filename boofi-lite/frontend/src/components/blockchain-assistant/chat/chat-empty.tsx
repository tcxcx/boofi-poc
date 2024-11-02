"use client";

import { useAccount } from "wagmi";
import { IdentityCard } from '@coinbase/onchainkit/identity'; 
import { base } from 'viem/chains';
 

export default function ChatEmpty() {
  const { address } = useAccount();

  return (
    <div className="w-full mt-[200px] todesktop:mt-24 md:mt-24 flex flex-col items-center justify-center text-center">
        <IdentityCard
        address={address}
        chain={base}
        schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
        /> 
      <span className="font-medium text-xl mt-6">
         Hi, how can I help you today?
      </span>
    </div>
  );
}
