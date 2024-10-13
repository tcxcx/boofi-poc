'use client';

import { ThemeProvider } from '@/components/theme-provider';
import type { ReactNode } from 'react';
import OnchainProviders from '@/components/base-onboard/onchain-providers';
import { cn } from "@/lib/utils";
import GridPattern from "@/components/grid-pattern";

type ProviderProps = {
  children: ReactNode;
};

export function Providers({ children }: ProviderProps) {

  return (
    <OnchainProviders>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <main className="bg-gradient-to-r from-indigo-100 via-cyan-100 to-purple-100 font-violet dark:bg-gradient-to-r dark:from-gray-900 dark:via-indigo-400 dark:to-gray-800">
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
        </main>
      </ThemeProvider>
    </OnchainProviders>
  );
}
