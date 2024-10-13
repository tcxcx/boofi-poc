import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CardSkeleton = () => {
  return (
    <div className="w-full max-w-md mx-auto p-4 border rounded-lg shadow-md">
      <Skeleton className="w-3/4 h-6 mb-2" />
      <Skeleton className="w-1/2 h-6 mb-4" />
      <Skeleton className="w-full h-48 mb-4" />
      <div className="space-y-2">
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-5/6 h-6" />
        <Skeleton className="w-4/6 h-6" />
      </div>
    </div>
  );
};

export default CardSkeleton;
