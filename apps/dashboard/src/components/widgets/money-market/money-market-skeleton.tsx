"use client";

import { Skeleton } from "@midday/ui/skeleton";

export function MoneyMarketSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-5/6" />
      <Skeleton className="h-6 w-2/3" />
    </div>
  );
}
