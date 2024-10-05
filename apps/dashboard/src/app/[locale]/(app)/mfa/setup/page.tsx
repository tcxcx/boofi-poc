import { SetupMfa } from "@/components/setup-mfa";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup MFA | BooFi",
};

export default function Setup() {
  return <SetupMfa />;
}
