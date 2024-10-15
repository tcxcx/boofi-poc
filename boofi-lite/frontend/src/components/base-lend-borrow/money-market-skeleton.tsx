"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MoneyMarketSkeleton() {
  return (
    <div className="min-h-screen bg-darkBg text-darkText p-6 font-neue">
      <div className="max-w-6xl mx-auto">
        {/* Title Skeleton */}
        <Skeleton className="h-10 w-1/2 mb-8" />
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel Skeleton */}
          <div className="flex-1 bg-secondaryBlack border-2 border-mainAccent rounded-none shadow-lg p-6">
            <Skeleton className="h-8 w-full mb-6" />
            <Skeleton className="h-12 w-full mb-6" />
            <Skeleton className="h-40 w-full mb-6" />
            <Skeleton className="h-16 w-full mb-6" />
          </div>
          {/* Right Panel Skeleton */}
          <div className="w-full lg:w-2/5">
            <Skeleton className="h-8 w-1/2 mb-6" />
            <Skeleton className="h-40 w-full mb-6" />
          </div>
        </div>
        {/* Info Section Skeleton */}
        <div className="mt-8 bg-main p-4 rounded-none border-2 border-black">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-2/3 mb-2" />
        </div>
      </div>
    </div>
  );
}
