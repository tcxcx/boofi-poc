import "@/css/global.scss";
import '@coinbase/onchainkit/styles.css';
import { cache } from "react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { isDev, siteURL } from "@/lib/constants";
import { Toaster } from "@/components/ui/toaster";
import LayoutMusic from "@/components/layout-music";
import { ThemeProvider } from "@/components/theme-provider";
import { IBM_Plex_Serif, Inconsolata } from "@next/font/google";
import GridPattern from "@/components/magicui/grid-pattern";
import OnchainProviders from '@/components/base-onboard/onchain-providers';
import { cn } from "@/utils";

const GridDebugger = dynamic(() => import("@/lib/debug/grid-debugger"), {
  ssr: false,
});

const locales = ["en", "es", "pt"] as const;
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ibm-plex-serif",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-inconsolata",
});

type Locale = (typeof locales)[number];

const getMetadata = cache((locale: string): Metadata => {
  if (!locales.includes(locale as Locale)) notFound();

  const safeLocale = locale as Locale;

  const localizedMetadata: Record<
    Locale,
    { title: string; description: string }
  > = {
    en: {
      title: "BooFi | Spooky Crypto-Finance Made Easy",
      description:
        "Where spooky crypto-finance becomes easy! BooFi is a friendly ghost guiding you through the world of savings, payments, remittances, loans and DeFi, tailored for emerging markets.",
    },
    es: {
      title: "BooFi | Finanzas Cripto Espeluznantes Hechas Fáciles",
      description:
        "¡Donde las finanzas cripto espeluznantes se vuelven fáciles! BooFi es un fantasma amigable que te guía por el mundo de los ahorros, pagos, remesas, préstamos y DeFi, adaptado para mercados emergentes.",
    },
    pt: {
      title: "BooFi | Finanças Cripto Assustadoras Feitas Fáceis",
      description:
        "Onde as finanças cripto assustadoras se tornam fáceis! BooFi é um fantasma amigável que te guia pelo mundo de poupanças, pagamentos, remessas, empréstimos e DeFi, adaptado para mercados emergentes.",
    },
  };

  return {
    title: {
      default: localizedMetadata[safeLocale].title,
      template: `%s | BooFi`,
    },
    description: localizedMetadata[safeLocale].description,
    metadataBase: siteURL,
    icons: [
      {
        rel: "apple-touch-icon",
        url: "/apple-touch-icon.png",
      },
    ],
    manifest: "/site.webmanifest",
    twitter: {
      card: "summary_large_image",
      title: localizedMetadata[safeLocale].title,
      creator: "@boofi_finance",
      siteId: "@boofi_finance",
    },
    keywords: [
      "crypto",
      "finance",
      "remittances",
      "DeFi",
      "emerging markets",
      "stablecoins",
      "payments",
    ],
    openGraph: {
      type: "website",
      locale: safeLocale,
      alternateLocale: locales.filter((l) => l !== safeLocale),
      url: siteURL,
      siteName: "BooFi",
      title: localizedMetadata[safeLocale].title,
      description: localizedMetadata[safeLocale].description,
      images: [
        {
          url: `${siteURL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "BooFi - Spooky Crypto-Finance",
        },
      ],
    },
    alternates: {
      canonical: siteURL,
      languages: Object.fromEntries(locales.map((l) => [l, `${siteURL}/${l}`])),
    },
  };
});

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {

  return (
    <html
      lang={locale}
      className={`${GeistSans.variable} ${GeistMono.variable} ${ibmPlexSerif.variable} ${inconsolata.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
            <OnchainProviders>
              <main className="bg-gradient-to-r from-indigo-100 via-cyan-100 to-purple-100 font-nubase dark:bg-gradient-to-r dark:from-gray-900 dark:via-indigo-400 dark:to-gray-800">
                <GridPattern
                  width={20}
                  height={20}
                  x={-1}
                  y={-1}
                  className={cn(
                    "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
                  )}
                />
                {children}
                {isDev && <GridDebugger />}
                <LayoutMusic />
              </main>
              <Toaster />
            </OnchainProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}

export async function generateMetadata({
  params: { locale },
}: RootLayoutProps): Promise<Metadata> {
  return getMetadata(locale);
}
