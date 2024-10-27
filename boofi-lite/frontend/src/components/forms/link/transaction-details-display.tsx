
import { Button } from "@/components/ui/button";
import { QRCode } from "react-qrcode-logo";
import { CopyIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TransactionDetailsDisplayProps } from "@/lib/types";


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
        <div
          className="flex justify-center mb-4 cursor-pointer"
          onClick={() => handleCopy(transactionDetails.paymentLink, "Payment Link")}
        >
          <QRCode value={transactionDetails.paymentLink} qrStyle="fluid" eyeRadius={100} size={200} />
        </div>

        <div className="flex justify-center text-xs text-primary mb-4">
          Share crypto with a link to your friends and family
        </div>
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
      <div className="my-5 flex justify-center gap-5 items-center">
        <Button
          size={"lg"}
          className="flex items-center gap-2"
          onClick={() => handleCopy(transactionDetails.paymentLink, "Payment Link")}
        >
          Copy Link
          <CopyIcon className="size-4" />
        </Button>
      </div>
    </>
  );
}
