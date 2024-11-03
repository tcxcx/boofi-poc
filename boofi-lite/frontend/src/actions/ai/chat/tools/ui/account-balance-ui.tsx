"use client";

import { BotCard, SpinnerMessage } from "@/components/blockchain-assistant/chat/messages";
import { useAccount, useBalance } from 'wagmi';

export function AccountBalanceUI() {
  const { address } = useAccount();
  const { data: balance, isError, isLoading } = useBalance({ address });

  if (!address) {
    return (
      <BotCard>
        No wallet connected.
      </BotCard>
    );
  }

  if (isLoading) {
    return (
      <BotCard>
        <SpinnerMessage />
        Loading balance...
      </BotCard>
    );
  }

  if (isError || !balance) {
    return (
      <BotCard>
        Unable to fetch balance.
      </BotCard>
    );
  }

  return (
    <BotCard className="font-sans space-y-4">
      <p className="font-mono">
        Your current balance is {balance.formatted} {balance.symbol}.
      </p>
    </BotCard>
  );
}
