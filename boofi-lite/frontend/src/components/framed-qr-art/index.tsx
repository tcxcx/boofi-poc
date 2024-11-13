import { QRImage } from 'react-qrbtf';
import { useEffect, useState } from "react";
import { FramedQRCodeProps } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * FramedQRCode Component
 * 
 * Renders a framed QR code with an optional label and allows
 * clicking the QR code to copy the link to the clipboard.
 */
export const FramedQRCode = ({ image, link, frameText, copyLink }: FramedQRCodeProps) => {
    const [logoBase64, setLogoBase64] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state

    const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            return await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        resolve(reader.result);
                    } else {
                        reject("Failed to convert image to Base64.");
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error converting image to Base64:", error);
            return "";
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") { // Check if window is available
            const loadImage = async () => {
                setIsLoading(true);
                const base64 = await convertImageToBase64(image);
                setLogoBase64(base64);
                setIsLoading(false);
            };

            if (image.startsWith("data:")) {
                setLogoBase64(image);
                setIsLoading(false);
            } else {
                loadImage();
            }
        }
    }, [image]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            {frameText && <div className="text-xs text-gray-500 mb-2">{frameText}</div>}

            {/* Conditionally render the Skeleton or the QR Code */}
            {isLoading ? (
                <Skeleton className="w-32 h-32 rounded-lg p-4 mb-2" />
            ) : (
                <div
                    className="qr-wrapper cursor-pointer"
                    onClick={copyLink}
                    role="button"
                    aria-label="Copy QR link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            copyLink?.();
                        }
                    }}
                >
                    <div className="qr-rotated">
                        <QRImage
                            value={link}
                            size={150}
                            image={logoBase64}
                            level="M"
                            type="rect"
                            darkColor="#000000"
                            lightColor="#FFFFFF"
                            posType="rect"
                            posColor="#ffc640"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FramedQRCode;
