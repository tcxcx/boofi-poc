'use client';

import { MoneyMarketSkeleton } from "@/components/base-lend-borrow/money-market-skeleton";
import { Suspense } from "react";
import PaymentLink from "@/components/payment-link-card"
import { useRequireConnection } from '@/hooks/use-require-connection';

export default function LinkPayments() {
    const isConnected = useRequireConnection();

    if (!isConnected) {
        return <MoneyMarketSkeleton />;
    }

    return (
        <div className="mx-auto px-4 relative flex flex-col justify-center overflow-hidden">
            <Suspense fallback={<MoneyMarketSkeleton />}>
                <div className="relative">
                    <PaymentLink />
                </div>
            </Suspense>
        </div>
    );
}
