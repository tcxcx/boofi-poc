'use client';

import { MoneyMarketSkeleton } from "@/components/base-lend-borrow/money-market-skeleton";
import { Suspense } from "react";
import LendBorrow from "@/components/base-lend-borrow/index";
import { useRequireConnection } from '@/hooks/use-require-connection';

export default function MoneyMarketPage() {
  const isConnected = useRequireConnection();

  if (!isConnected) {
    return <MoneyMarketSkeleton />;
  }

  return (
    <div className="mx-auto px-4 relative flex flex-col justify-center overflow-hidden">
      <Suspense fallback={<MoneyMarketSkeleton />}>
        <div className="relative">
          <LendBorrow />
        </div>
      </Suspense>
    </div >

  );
}
