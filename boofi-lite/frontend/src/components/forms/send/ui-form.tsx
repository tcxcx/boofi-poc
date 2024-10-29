
import { Button } from "@/components/ui/button";
import CurrencyDisplayer from "@/components/currency";
import { LinkUiFormProps } from "@/lib/types";

export default function LinkUiForm({
  tokenAmount,
  handleValueChange,
  availableTokens,
  setSelectedToken,
  chainId,
  handleSendPaymentClick,
}: LinkUiFormProps & { handleSendPaymentClick: () => void }) {
  return (
    <>
      <div className="flex w-full md:h-[300px] lg:h-[400px] flex-col justify-between rounded-2xl border bg-background">
        <div className="px-4 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-xl">💸👻💸</span>
            <span>You are sending</span>
          </div>
          <CurrencyDisplayer
            tokenAmount={tokenAmount}
            onValueChange={handleValueChange}
            availableTokens={availableTokens}
            onTokenSelect={setSelectedToken}
            currentNetwork={chainId ?? null}
          />
        </div>
      </div>
      <div className="flex justify-between w-full space-x-2">
        <Button
          size={"lg"}
          className="mt-5 flex items-center gap-2 self-end w-full"
          onClick={handleSendPaymentClick}
          variant={"fito"}
        >
          <span>Send 👻</span>
        </Button>
      </div>
    </>
  );
}
