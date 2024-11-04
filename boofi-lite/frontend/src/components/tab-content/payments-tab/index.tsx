'use client';

import React, { Suspense } from "react";
import { Translations } from "@/lib/types/translations";
import PaymentLink from "@/components/payment-link-card";
import SendPayment from "@/components/forms/send";
import { Tabs, TabsContent, TabsList, TabsTriggerRight } from '@/components/ui/tabs';
import {BaseNameDialogAlert } from "@/components/ens-alert-dialog";
import SelectPaymentSkeleton from "./select-payment-skeleton";

interface HomeContentProps {
  translations: Translations["Home"];
  address: string;
}

export const PaymentLinkTabContent: React.FC<HomeContentProps> = ({ translations, address }) => {
  return (
    <>
      <BaseNameDialogAlert translations={translations}  address={address} />
      <Tabs defaultValue="send-payment" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mt-1">
          <TabsTriggerRight value="send-payment" position="left">
            👽 Send Payment 🛸
          </TabsTriggerRight>
          <TabsTriggerRight value="payment-link" position="right">
            🥜 Payment Links 🔗
          </TabsTriggerRight>
        </TabsList>
        <TabsContent value="send-payment">
          <Suspense fallback={<SelectPaymentSkeleton />}>
            <SendPayment />
          </Suspense>
        </TabsContent>
        <TabsContent value="payment-link">
          <Suspense fallback={<SelectPaymentSkeleton />}>
            <PaymentLink />
          </Suspense>
        </TabsContent>
      </Tabs>
    </>
  );
};
