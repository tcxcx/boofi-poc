import '@coinbase/onchainkit/styles.css';
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Music from "@/components/music";
import { Toaster } from "@/components/ui/toaster";
import Container from "@/components/container";

// Base Neue Fonts
const baseNeueBlack = localFont({
  src: "./fonts/base-neue/BaseNeueTrial-Black.woff2",
  variable: "--font-base-neue-black",
  weight: "900",
});
const baseNeueBlackOblique = localFont({
  src: "./fonts/base-neue/BaseNeueTrial-BlackOblique.woff2",
  variable: "--font-base-neue-black-oblique",
  weight: "900",
  style: "oblique",
});
const baseNeueBold = localFont({
  src: "./fonts/base-neue/BaseNeueTrial-Bold.woff2",
  variable: "--font-base-neue-bold",
  weight: "700",
});
const baseNeueBoldOblique = localFont({
  src: "./fonts/base-neue/BaseNeueTrial-BoldOblique.woff2",
  variable: "--font-base-neue-bold-oblique",
  weight: "700",
  style: "oblique",
});

// Power Neue Fonts
const neuePowerBold = localFont({
  src: "./fonts/power-neue/NeuePowerTrial-Bold.woff2",
  variable: "--font-neue-power-bold",
  weight: "700",
});
const neuePowerBoldOblique = localFont({
  src: "./fonts/power-neue/NeuePowerTrial-BoldOblique.woff2",
  variable: "--font-neue-power-bold-oblique",
  weight: "700",
  style: "oblique",
});

// Geist Fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Money Market | BooFi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${baseNeueBlack.variable} ${baseNeueBlackOblique.variable} ${baseNeueBold.variable} ${baseNeueBoldOblique.variable} ${neuePowerBold.variable} ${neuePowerBoldOblique.variable} antialiased custom-scrollbar`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <Header />
            <Container>
              {children}
            </Container>
            <Music />
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
