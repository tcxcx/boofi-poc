import { XIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { OverlayPayNameProps } from "@/lib/types";
import { FramedQRCode } from "@/components/framed-qr-art";
import { NEXT_PUBLIC_URL } from "@/lib/wagmi/config";

/**
 * OverlayPayName Component
 * 
 * Displays an overlay with the payment link, QR code, copy button, and share buttons.
 * Ensures the payment link includes the current locale.
 */
export const OverlayPayName = ({
    handleToggleOverlay,
    copyLink,
    link,
    shareOnWhatsApp,
    shareOnTelegram,
}: OverlayPayNameProps) => {
    const locale = useLocale();
    const supportedLocales = ["en", "es", "pt"];
    
    /**
     * Generates a localized link with the correct domain based on the environment.
     * 
     * @param {string} url - The original payment link.
     * @returns {string} - The localized payment link with the appropriate base URL.
     */
    const getLocalizedLink = (url: string): string => {
        try {
            // Use the NEXT_PUBLIC_URL as the base URL
            const urlObj = new URL(url, NEXT_PUBLIC_URL);
            const pathSegments = urlObj.pathname.split('/').filter(segment => segment);
            
            // Check if the first segment is a supported locale
            if (pathSegments.length > 0 && supportedLocales.includes(pathSegments[0])) {
                return urlObj.toString();
            } else {
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
        return url.replace(/^https?:\/\//, '');
    };
    
    const displayLink = getDisplayLink(fullLocalizedLink);

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
                <FramedQRCode
                    image="/images/BooFi-icon.png"
                    link={fullLocalizedLink}
                    frameText="Scan to Pay"
                    copyLink={copyLink}
                />

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
                        className="border border-gray-300 dark:border-gray-600"
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
                                <p>Get paid on WhatsApp</p>
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
                                <p>Get paid on Telegram</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>
        </div>
    );
};

export default OverlayPayName;
