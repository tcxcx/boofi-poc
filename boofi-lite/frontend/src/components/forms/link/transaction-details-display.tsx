import { Button } from "@/components/ui/button";
import { CopyIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TransactionDetailsDisplayProps } from "@/lib/types";
import FramedQRCode from "@/components/framed-qr-art";

export default function TransactionDetailsDisplay({
  transactionDetails,
  chainId,
  handleCopy,
  handleShare,
  truncateHash,
}: TransactionDetailsDisplayProps) {
  return (
    <>
      <div className="flex w-full flex-col justify-between rounded-2xl border bg-white p-5">
        {/* QR Code Section */}
        <div className="flex justify-center">
          <FramedQRCode
            image="/images/BooFi-icon.png"
            link={transactionDetails.paymentLink}
            frameText="Send Crypto with this unique Link"
            copyLink={() => handleCopy(transactionDetails.paymentLink, "Payment Link")}
          />

        </div>
        {/* Copy Link Button */}
        <div className="flex justify-center items-center mb-2">
          <Button
            size={"lg"}
            className="flex items-center gap-2"
            onClick={() => handleCopy(transactionDetails.paymentLink, "Payment Link")}
          >
            Copy Link
            <CopyIcon className="size-4" />
          </Button>
        </div>
        <div className="flex justify-center text-xs text-primary my-2">
          Send crypto with this secure vault link to your friends and family
        </div>

        {/* Share Buttons */}
        <div className="flex justify-center gap-4 mb-4 mx-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleShare("whatsapp")}
            className="text-xs px-4"
          >
            <Image src="/icons/whatsapp.svg" alt="WhatsApp" width={24} height={24} />
            Share on WhatsApp
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleShare("telegram")}
            className="text-xs px-4"
          >
            <Image src="/icons/telegram.png" alt="Telegram" width={24} height={24} />
            Share on Telegram
          </Button>
        </div>

        {/* Transaction Hash and Block Explorer Link */}
        <div className="mt-2 flex h-16 items-center border-t text-xs">
          <div className="mx-5 flex w-full items-center justify-between">
            <div className="flex flex-col">
              <span className="font-semibold flex items-center">Transaction Hash:</span>
              <Button
                size="sm"
                variant="link"
                onClick={() => handleCopy(transactionDetails.transactionHash, "Transaction Hash")}
              >
                {truncateHash(transactionDetails.transactionHash)}
              </Button>
            </div>
            {chainId && transactionDetails && (
              <div className="flex items-center">
                <Link href={`https://etherscan.io/tx/${transactionDetails.transactionHash}`} target="_blank">
                  <Button size="sm" variant="ghost" className="px-2">
                    View in Block Explorer
                    <ChevronRightIcon className="ml-1 size-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
