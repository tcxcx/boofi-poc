import { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { siteURL } from '@/lib/constants';

const locales = ['en', 'es', 'pt'] as const;
type Locale = (typeof locales)[number];

interface LocalizedMetadata {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
}

const localizedMetadata: Record<Locale, LocalizedMetadata> = {
  en: {
    title: 'BooFi | Spooky Crypto-Finance Made Easy',
    description:
      'Where spooky crypto-finance becomes easy! BooFi is a friendly ghost guiding you through the world of savings, payments, remittances, loans and DeFi, tailored for emerging markets.',
    ogTitle: 'BooFi - Spooky Crypto-Finance Made Easy',
    ogDescription:
      'Where spooky crypto-finance becomes easy! BooFi is a friendly ghost guiding you through the world of savings, payments, remittances, loans and DeFi, tailored for emerging markets.',
  },
  es: {
    title: 'BooFi | Finanzas Cripto Espeluznantes Hechas Fáciles',
    description:
      '¡Donde las finanzas cripto espeluznantes se vuelven fáciles! BooFi es un fantasma amigable que te guía por el mundo de los ahorros, pagos, remesas, préstamos y DeFi, adaptado para mercados emergentes.',
    ogTitle: 'BooFi - Finanzas Cripto Espeluznantes Hechas Fáciles',
    ogDescription:
      '¡Donde las finanzas cripto espeluznantes se vuelven fáciles! BooFi es un fantasma amigable que te guía por el mundo de los ahorros, pagos, remesas, préstamos y DeFi, adaptado para mercados emergentes.',
  },
  pt: {
    title: 'BooFi | Finanças Cripto Assustadoras Feitas Fáceis',
    description:
      'Onde as finanças cripto assustadoras se tornam fáceis! BooFi é um fantasma amigável que te guia pelo mundo de poupanças, pagamentos, remessas, empréstimos e DeFi, adaptado para mercados emergentes.',
    ogTitle: 'BooFi - Finanças Cripto Assustadoras Feitas Fáceis',
    ogDescription:
      'Onde as finanças cripto assustadoras se tornam fáceis! BooFi é um fantasma amigável que te guia pelo mundo de poupanças, pagamentos, remessas, empréstimos e DeFi, adaptado para mercados emergentes.',
  },
};

// Cached metadata generation for performance
const getMetadata = cache((locale: string): Metadata => {
  if (!locales.includes(locale as Locale)) notFound();

  const safeLocale = locale as Locale;
  const meta = localizedMetadata[safeLocale];

  return {
    title: {
      default: meta.title,
      template: `%s | BooFi`,
    },
    description: meta.description,
    metadataBase: new URL(siteURL),
    icons: [
      {
        rel: 'icon',
        url: '/favicon.ico',
      },
      {
        rel: 'apple-touch-icon',
        url: '/apple-touch-icon.png',
      },
    ],
    manifest: '/site.webmanifest',
    themeColor: '#ffffff',
    referrer: 'origin-when-cross-origin',
    keywords: [
      'crypto',
      'finance',
      'remittances',
      'DeFi',
      'emerging markets',
      'stablecoins',
      'payments',
      'savings',
      'loans',
      'ERC20 tokens',
      'blockchain',
      'smart contracts',
      'cryptocurrency',
    ],
    viewport: 'width=device-width, initial-scale=1',
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: siteURL,
      languages: Object.fromEntries(locales.map((l) => [l, `${siteURL}/${l}`])),
    },
    openGraph: {
      type: 'website',
      locale: safeLocale,
      alternateLocale: locales.filter((l) => l !== safeLocale),
      url: siteURL,
      siteName: 'BooFi',
      title: meta.ogTitle,
      description: meta.ogDescription,
      images: [
        {
          url: `${siteURL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'BooFi - Spooky Crypto-Finance',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      creator: '@boofi_finance',
      site: '@boofi_finance',
      images: `${siteURL}/og-image.jpg`,
    },
  };
});

export function generateBooFiMetadata(locale: string): Metadata {
  return getMetadata(locale);
}
