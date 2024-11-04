import { Skeleton } from "@/components/ui/skeleton";
import { background, cn, color, pressable, text } from "../styles/theme";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
// import { ConnectWallet } from "../../wallet";

export function SwapButton({
  className,
  disabled = false,
  address,
  to,
  from,
  lifecycleStatus: { statusName },
  handleSubmit,
}: any) {
  const isLoading =
    to.loading ||
    from.loading ||
    statusName === "transactionPending" ||
    statusName === "transactionApproved";

  const isDisabled =
    !from.amount ||
    !from.token ||
    !to.amount ||
    !to.token ||
    disabled ||
    isLoading;

  // disable swap if to and from token are the same
  const isSwapInvalid = to.token?.address === from.token?.address;

  // prompt user to connect wallet
  if (!isDisabled && !address) {
    return <ConnectWallet className="mt-4 w-full" />;
  }

  return (
    <button
      type="button"
      className={cn(
        background.primary,
        "w-full rounded-xl",
        "mt-4 px-4 py-3",
        isDisabled && pressable.disabled,
        text.headline,
        className
      )}
      onClick={() => handleSubmit()}
      disabled={isDisabled || isSwapInvalid}
      data-testid="ockSwapButton_Button"
    >
      {isLoading ? (
        <Skeleton className="w-full h-10" />
      ) : (
        <span className={cn(text.headline, color.inverse)}>Swap</span>
      )}
    </button>
  );
}
