import { MoneyMarketSkeleton } from "@/components/base-lend-borrow/money-market-skeleton";
import { Suspense } from "react";
import OnboardingFlow from "@/components/base-onboard/onboarding-flow";

export default function MoneyMarketPage() {
  return (
    <Suspense fallback={<MoneyMarketSkeleton />}>
      <OnboardingFlow />
    </Suspense>
  );
}
