import React from "react"

export const PaymentLinkSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="flex space-x-2 mb-4">
      <div className="h-8 bg-gray-300 rounded w-1/2"></div>
      <div className="h-8 bg-gray-300 rounded w-1/2"></div>
    </div>
    <div className="h-12 bg-gray-300 rounded w-full mb-4"></div>
    <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
    <div className="h-12 bg-gray-300 rounded w-full"></div>
  </div>
)
