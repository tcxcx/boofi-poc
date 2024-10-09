import { ErrorFallback } from "@/components/error-fallback";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { MoneyMarketSkeleton } from "./money-market-skeleton";
import { MoneyMarketWidget } from "./money-market-widget";

export function MoneyMarket() {
  return (
    <div className="border relative aspect-square overflow-hidden p-4 md:p-8">
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Suspense fallback={<MoneyMarketSkeleton />}>
          <MoneyMarketWidget />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
