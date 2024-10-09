import { MoneyMarketSkeleton } from "@/components/base-lend-borrow/money-market-skeleton";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const LendBorrow = dynamic(
  () => import("@/components/base-lend-borrow/base-lend-borrow"),
  {
    suspense: true,
  },
);

export const metadata: Metadata = {
  title: "Money Market | BooFi",
};

export default function MoneyMarketPage() {
  return (
    <Suspense fallback={<MoneyMarketSkeleton />}>
      <LendBorrow />
    </Suspense>
  );
}
