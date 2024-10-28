import { useState } from "react";
import { Terminal } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useCopyToClipboard } from "@/hooks/peanut-protocol/use-clipboard";
import { Button } from "@/components/ui/button";
import { Translations } from "@/lib/types/translations";
import { XIcon } from "lucide-react";
import { baseSepolia } from 'viem/chains';
import { ShinyBadge } from "@/components/ui/shiny-badge";
import { getName } from "@coinbase/onchainkit/identity";

interface BaseNameDialogAlertProps {
  translations: Translations["Home"];
  address: string;
}

export const BaseNameDialogAlert = async ({ translations, address }: BaseNameDialogAlertProps) => {
  const [copiedText, copy] = useCopyToClipboard();
  const [overlayVisible, setOverlayVisible] = useState(false);

  const ensName = await getName({ address: address as `0x${string}`, chain: baseSepolia }) ?? 'no name';

  console.log("Here is your ens name", ensName);
  
  const link = `https://defi.boofi.xyz/${ensName}`;
  
  console.log("Here is your ens name", ensName);

  const copyLink = () => {
    if (ensName) {
      copy(link);
    }
  };

  const handleToggleOverlay = () => {
    setOverlayVisible(!overlayVisible);
  };

  const onClickLinkBaseNames = () => {
    const url =  `https://www.base.org/names`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative p-2 rounded-b-base bg-white dark:bg-secondaryBlack text-xs font-base transition-all">
      {ensName && (
        <ShinyBadge 
          text="New Feature! 🎉" 
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[10px] p-1"
        />
      )}
      {isFetching ? (
        <Skeleton className="h-4 w-full mt-2" />
      ) : (
        <div>
          {ensName ? (
            <>
              <div 
                onClick={handleToggleOverlay} 
                className="flex items-center gap-1 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-500 hover:underline text-xs"
              >
                <Terminal className="h-3 w-3" />
                <span>Hi {ensName}! Send and receive payments with your BooFi link name</span>
              </div>
              {overlayVisible && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                  <div className="relative bg-white dark:bg-secondaryBlack p-4 rounded-lg shadow-lg max-w-sm w-full">
                    <button onClick={handleToggleOverlay} className="absolute right-4 top-4">
                      <XIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <h2 className="text-sm font-semibold mb-2">BooFi Payment Link</h2>
                    <p className="text-xs mb-2">Your payment link:</p>
                    <input
                      type="text"
                      value={`https://defi.boofi.xyz/${ensName}`}
                      readOnly
                      className="w-full mt-1 px-2 py-1 border rounded-md text-xs text-gray-500 bg-gray-100"
                    />
                    <Button className="mt-2 text-xs" onClick={copyLink}>
                      Copy Link
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1 inline-block">
              <div 
                onClick={onClickLinkBaseNames} 
                className="flex items-center gap-1 cursor-pointer text-blue-500 text-xs hover:underline"
              >
                <Terminal className="h-3 w-3" />
                <span>Create your Base Name</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
