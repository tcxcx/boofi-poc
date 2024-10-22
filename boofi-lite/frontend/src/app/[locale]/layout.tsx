// app/layout.tsx
import '@/css/global.scss';
import '@coinbase/onchainkit/styles.css';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { generateBooFiMetadata } from '@/lib/seo/landing-layout';
import { isDev, siteURL } from '@/lib/constants';
import { Toaster } from '@/components/ui/toaster';
import LayoutMusic from '@/components/layout-music';
import { ThemeProvider } from '@/components/theme-provider';
import { IBM_Plex_Serif, Inconsolata } from '@next/font/google';
import GridPattern from '@/components/magicui/grid-pattern';
import OnchainProviders from '@/components/base-onboard/onchain-providers';
import { cn } from '@/utils';

const GridDebugger = dynamic(() => import('@/lib/debug/grid-debugger'), {
  ssr: false,
});

const locales = ['en', 'es', 'pt'] as const;
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-ibm-plex-serif',
});

const inconsolata = Inconsolata({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-inconsolata',
});

type Locale = (typeof locales)[number];

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export async function generateMetadata({
  params: { locale },
}: RootLayoutProps): Promise<Metadata> {
  return generateBooFiMetadata(locale);
}

export default function RootLayout({
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
                  '[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]'
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
