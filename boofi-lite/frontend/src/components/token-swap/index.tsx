"use client";

import React from 'react';
import { 
  Swap, 
  SwapAmountInput, 
  SwapToggleButton, 
  SwapButton, 
  SwapMessage, 
  SwapToast, 
} from '@coinbase/onchainkit/swap'; 
import { useAccount } from 'wagmi';
import type { Token } from '@coinbase/onchainkit/token';
import { ETHToken, USDCToken } from '@/utils/tokens';
import { cn } from '@/utils';

const swappableTokens: Token[] = [ETHToken, USDCToken];

export default function TokenSwap() {
  const { address } = useAccount();

  if (!address) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className='font-nupower text-xl'>Please connect your wallet</div>
      </div>
    );
  }

  return (
<>  
    <Swap className='bg-background'>
        <SwapAmountInput
          label="Sell"
          swappableTokens={swappableTokens}
          token={ETHToken}
          type="from"
          className={cn(
            "mb-4 p-4 bg-card dark:bg-darkCard border-2 border-border dark:border-darkBorder rounded-md",
            "focus-within:shadow-light dark:focus-within:shadow-dark"
          )}
        />
        <SwapToggleButton className="bg-main border-2 border-border dark:border-white rounded-full shadow-light dark:shadow-dark hover:bg-clr-yellow" />
        <SwapAmountInput
          label="Buy"
          swappableTokens={swappableTokens}
          token={USDCToken}
          type="to"
          className={cn(
            "mb-4 p-4 bg-card dark:bg-darkCard border-2 border-border dark:border-darkBorder rounded-md",
            "focus-within:shadow-light dark:focus-within:shadow-dark"
          )}
        />
        <SwapButton className='bg-main border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none'/>
        <SwapMessage className="mt-4 text-sm text-muted-foreground" />
        <SwapToast className="bg-main border-2 border-border dark:border-darkBorder rounded-md shadow-light dark:shadow-dark" />
      </Swap>
    </> 
    );
}