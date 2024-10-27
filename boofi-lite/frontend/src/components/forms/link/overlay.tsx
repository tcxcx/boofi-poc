import { FadeText } from "@/components/magicui/fade-text";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import TransactionDetailsDisplay from "./transaction-details-display";
import { TransactionDetails } from "@/lib/types";

interface OverlayProps {
  handleCloseOverlay: () => void;
  currentText: string;
  transactionDetails: TransactionDetails | null;
  chainId: number | undefined;
  handleCopy: (text: string, label: string) => void;
  handleShare: (platform: string) => void;
  truncateHash: (hash: string) => string;
}

export default function Overlay({
  handleCloseOverlay,
  currentText,
  transactionDetails,
  chainId,
  handleCopy,
  handleShare,
  truncateHash,
}: OverlayProps) {
  return (
    <div className="animate-in fade-in-0 fixed inset-0 z-50 bg-white/90">
      <div className="relative flex size-full items-center justify-center">
        <button className="absolute right-4 top-4" onClick={handleCloseOverlay}>
          <XIcon className="size-6" />
        </button>
        <div className="flex flex-col items-center gap-10">
          <AnimatePresence mode="wait">
            <FadeText
              key="currentText"
              className="text-center text-4xl bg-gradient-to-b from-indigo-300 to-indigo-900/80 bg-clip-text font-semibold leading-none text-transparent dark:from-indigo-600 dark:to-slate-900/10"
              direction="up"
              framerProps={{ show: { transition: { delay: 0.2 } } }}
              text={currentText}
            />
          </AnimatePresence>
          {transactionDetails ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center"
            >
              <TransactionDetailsDisplay
                transactionDetails={transactionDetails}
                chainId={chainId}
                handleCopy={handleCopy}
                handleShare={handleShare}
                truncateHash={truncateHash}
              />
            </motion.div>
          ) : (
            <div role="status">
              <svg
                aria-hidden="true"
                className="size-8 animate-spin fill-neutral-600 text-neutral-200 dark:text-neutral-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* SVG paths */}
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 
                  0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 
                  0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 
                  27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 
                  50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 
                  9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 
                  97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 
                  20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 
                  4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 
                  0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 
                  6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 
                  9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 
                  12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 
                  25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 
                  38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
