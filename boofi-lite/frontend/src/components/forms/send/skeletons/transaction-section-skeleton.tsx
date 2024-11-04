import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const TransactionSectionSkeleton = () => {
  return (
    <div className="flex flex-col w-full space-y-2 pt-4">
      <Skeleton className="w-full h-12 mb-2" />
      <Skeleton className="w-full h-12" />
    </div>
  );
};

export default TransactionSectionSkeleton;
