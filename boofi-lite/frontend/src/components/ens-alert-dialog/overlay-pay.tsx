// boofi-lite/frontend/src/components/OverlayPayName.tsx

import { XIcon, CopyIcon } from "lucide-react"; // Importing necessary icons
import { Button } from "@/components/ui/button"; // Importing the Button component
import { QRCode } from "react-qrcode-logo"; // Importing the QRCode component
import Image from "next/image"; // Importing Image component for icons
import { useLocale } from "next-intl"; // To get current locale
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";

/**
 * Interface defining the props for the OverlayPayName component.
 */
interface OverlayPayNameProps {
  /**
   * Function to toggle the visibility of the overlay.
   */
  handleToggleOverlay: () => void;
  
  /**
   * Function to copy the payment link to the clipboard.
   */
  copyLink: () => void;
  
  /**
   * The payment link to be displayed and copied.
   */
  link: string;
  
  /**
   * Function to share the payment link on WhatsApp.
   */
  shareOnWhatsApp: (localizedLink: string) => void;
  
  /**
   * Function to share the payment link on Telegram.
   */
  shareOnTelegram: (localizedLink: string) => void;
}

/**
 * OverlayPayName Component
 * 
 * Displays an overlay with the payment link, QR code, copy button, and share buttons.
 * Ensures the payment link includes the current locale.
 * 
 * @param {OverlayPayNameProps} props - The props for the component.
 * @returns {JSX.Element} The overlay UI component.
 */
export const OverlayPayName = ({
  handleToggleOverlay,
  copyLink,
  link,
  shareOnWhatsApp,
  shareOnTelegram,
}: OverlayPayNameProps) => {
  const locale = useLocale();
  
  // Define supported locales
  const supportedLocales = ["en", "es", "pt"];
  
  /**
   * Adjusts the link to include the current locale if not already present.
   * Assumes that the locale should be the first path segment.
   * 
   * @param {string} url - The original payment link.
   * @returns {string} - The localized payment link.
   */
  const getLocalizedLink = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment);
      
      // Check if the first segment is a supported locale
      if (pathSegments.length > 0 && supportedLocales.includes(pathSegments[0])) {
        // Locale already present
        return url;
      } else {
        // Prepend the current locale to the path
        urlObj.pathname = `/${locale}/${urlObj.pathname}`.replace('//', '/');
        return urlObj.toString();
      }
    } catch (error) {
      console.error("Invalid URL provided to OverlayPayName:", url);
      // Return the original link if URL parsing fails
      return url;
    }
  };

  const fullLocalizedLink = getLocalizedLink(link);
  
  /**
   * Generates the display link by removing the protocol (https:// or http://).
   * 
   * @param {string} url - The full localized link.
   * @returns {string} - The link without the protocol.
   */
  const getDisplayLink = (url: string): string => {
      return url.substring(8);
    return url; 
  };
  
  const displayLink = getDisplayLink(fullLocalizedLink);

  const handleQRCodeClick = () => {
    copyLink();
  };
  


  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-secondaryBlack p-6 rounded-r-lg shadow-lg max-w-md w-full">
        
        {/* Close Button */}
        <button
          onClick={handleToggleOverlay}
          className="absolute right-4 top-4 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          aria-label="Close"
        >
          <XIcon className="h-6 w-6" />
        </button>

        {/* Overlay Header */}
        <h2 className="text-lg font-semibold mb-4 text-center">BooFi Payment Link</h2>
        
       
        {/* QR Code Section */}
        <div
          className="flex justify-center mb-4 cursor-pointer"
          onClick={handleQRCodeClick}
          role="button"
          aria-label="Copy payment link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleQRCodeClick();
            }
          }}
        >
          <QRCode value={fullLocalizedLink} qrStyle="dots" size={150} />
        </div>

        {/* Payment Link and Copy Button */}
        <div className="flex items-center justify-center mb-4">
          <input
            type="text"
            value={displayLink}
            readOnly
            className="flex-grow border text-center justify-center border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800"
            aria-label="Payment Link"
          />
          <Button
            onClick={copyLink}
            variant="outline"
            className=" border border-gray-300  dark:border-gray-600 "
            aria-label="Copy Link"
          >
            <CopyIcon className="h-4 w-4" />
          </Button>
        </div>
        <TooltipProvider>
          <div className="flex justify-center gap-4">
            {/* Share on WhatsApp */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => shareOnWhatsApp(fullLocalizedLink)}
                  className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-100 dark:hover:bg-gray-700"
                  aria-label="Share on WhatsApp"
                >
                  <Image src="/icons/whatsapp.svg" alt="WhatsApp" width={20} height={20} />
                  WhatsApp
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Get paid on</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Share on Telegram */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => shareOnTelegram(fullLocalizedLink)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700"
                  aria-label="Share on Telegram"
                >
                  <Image src="/icons/telegram.png" alt="Telegram" width={20} height={20} />
                  Telegram
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Get paid on</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default OverlayPayName;