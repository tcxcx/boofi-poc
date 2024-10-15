import { HomeContent } from "@/components/home";
import { Translations } from "@/lib/types/translations";
import { useTranslations } from "next-intl";
import Header from "@/components/header";
import Container from "@/components/container";
import { Suspense } from "react";
import { MoneyMarketSkeleton } from "@/components/base-lend-borrow/money-market-skeleton";
export default function Home() {
  const t = useTranslations("Home");

  const translations: Translations["Home"] = {
    welcome: t("welcome"),
    to: t("to"),
    slogan: {
      part1: t("slogan.part1"),
      part2: t("slogan.part2"),
      part3: t("slogan.part3"),
      part4: t("slogan.part4"),
    },
    logoAlt: t("logoAlt"),
    neoMatrixAlt: t("neoMatrixAlt"),
    pillGifAlt: t("pillGifAlt"),
    boofiMatrixAlt: t("boofiMatrixAlt"),
    matrixMemeAlt: t("matrixMemeAlt"),
  };

  return (
    <div className="custom-scrollbar">
      <Header />
      <div className="mx-auto px-4 relative flex flex-col justify-center overflow-hidden">
        <Container>
          <div className="relative">
            <Suspense fallback={<MoneyMarketSkeleton />}>
              <HomeContent translations={translations} />
            </Suspense>
          </div>
        </Container>
      </div>
    </div>
  );
}
