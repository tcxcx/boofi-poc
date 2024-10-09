import dynamic from "next/dynamic";
import { Suspense } from "react";
import { MoneyMarketSkeleton } from "./money-market-skeleton";

const LendBorrow = dynamic(() => import("@/components/base-lend-borrow"), {
  ssr: false,
  loading: () => <MoneyMarketSkeleton />,
});

export function MoneyMarketWidget() {
  return (
    <div className="h-full">
      <div className="flex justify-between">
        <div>
          <h2 className="text-lg font-medium">Money Market</h2>
        </div>
      </div>
      <div className="mt-4">
        <LendBorrow />
      </div>
    </div>
  );
}
