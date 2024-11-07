import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCopyToClipboard } from "@/hooks/peanut-protocol/use-clipboard";
import { Button } from "@/components/ui/button";

import { useEnsName } from "@/hooks/use-ens-name";
import { base } from "viem/chains";
import { OverlayPayName } from "./overlay-pay";
import { BaseNameDialogAlertProps } from "@/lib/types";
import { useLocale } from "next-intl";

export const BaseNameDialogAlert = ({
  translations,
  address,
}: BaseNameDialogAlertProps) => {
  const [copiedText, copy] = useCopyToClipboard();
  const [overlayVisible, setOverlayVisible] = useState(false);
  const { ensName, isLoading, ensNotFound } = useEnsName({
    address,
    chain: base,
  });
  const locale = useLocale(); // Get the current locale
  console.log({ ensName });

  // Dynamically generate the base URL using window.location and include the locale
  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.host}/${locale}`;
    }
    return `https://defi.boofi.xyz/${locale}`; // Fallback for server-side rendering
  };

  const link = `${getBaseUrl()}/${ensName}`;

  const copyLink = () => {
    if (ensName) {
      copy(link);
    }
  };

  /**
   * Shares the payment link on WhatsApp.
   */
  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      link
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  /**
   * Shares the payment link on Telegram.
   */
  const shareOnTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
      link
    )}&text=${encodeURIComponent("Check out my BooFi payment link!")}`;
    window.open(telegramUrl, "_blank");
  };

  const handleToggleOverlay = () => {
    setOverlayVisible(!overlayVisible);
  };

  const onClickLinkBaseNames = () => {
    const url = ensName
      ? `https://www.base.org/names/${ensName}`
      : `https://www.base.org/names/?address=${address}`;
    window.open(url, "_blank");
  };

  return (
    <div className="relative text-xs font-nupower font-bold transition-all">
      {isLoading ? (
        <Skeleton className="h-4 w-full mt-2" />
      ) : (
        <div>
          {!ensNotFound && ensName ? (
            <>
              <div className="flex items-center gap-1 inline-block justify-center">
                <div className="flex flex-col items-center justify-center">
                  <h1 className="text-center">
                    <span className="font-clash"> Hi {ensName}! </span>
                  </h1>
                  <Button
                    variant="link"
                    size="noPadding"
                    onClick={handleToggleOverlay}
                    className="text-center cursor-pointer text-blue-500 text-xs hover:underline"
                  >
                    <span>
                      {" "}
                      Send and receive payments with your BooFi link name
                    </span>
                  </Button>
                </div>
              </div>

              {overlayVisible && (
                <OverlayPayName
                  handleToggleOverlay={handleToggleOverlay}
                  copyLink={copyLink}
                  link={link}
                  shareOnWhatsApp={shareOnWhatsApp}
                  shareOnTelegram={shareOnTelegram}
                />
              )}
            </>
          ) : (
            <div className="flex items-center inline-block justify-center">
              <Button
                variant="link"
                size="noPadding"
                onClick={onClickLinkBaseNames}
                className="flex items-center gap-1 cursor-pointer text-blue-500 text-xs hover:underline"
              >
                <span>Create your Base Name</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
