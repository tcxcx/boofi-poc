"use client";

import React from "react";
import { Translations } from "@/lib/types/translations";
import PaymentLink from "@/components/payment-link-card";

interface HomeContentProps {
  translations: Translations["Home"];
}

export const PaymentLinkTabContent: React.FC<HomeContentProps> = ({ translations }) => {


  return (
    <>
        <PaymentLink />
    </>      

  );
};
