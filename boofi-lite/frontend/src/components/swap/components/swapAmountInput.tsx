import { useCallback, useEffect, useMemo } from "react";
import { TextInput } from "../internal/components/textInput";
import { useValue } from "@/hooks/use-value";
import { getRoundedAmount } from "@/utils/getRoundedAmount";
import { isValidAmount } from "@/utils/isValidAmount";
import { background, cn, color, pressable, text } from "../styles/theme";
import { useChainId, useReadContract } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import { Token } from "@/lib/types";
import { TokenChip } from "@/components/Token/Chip";

export function SwapAmountInput({
  className,
  delayMs = 1000,
  label,
  token,
  swappableTokens,
  address,
  handleAmountChange,
  setToken,
  amount,
  setAmount,
  amountUSD,
  loading,
}: {
  className?: string;
  delayMs?: number;
  label: string;
  token: Token;
  swappableTokens: Token[];
  address: string;
  handleAmountChange: (amount: string, token: Token) => void;
  setToken: (token: Token) => void;
  amount: string;
  setAmount: (amount: string) => void;
  amountUSD: string;
  loading: boolean;
}) {
  useEffect(() => {
    if (token) {
      setToken(token);
    }
  }, [token, setToken]);
  const chainId = useChainId();

  const { data: userTokenBalance } = useReadContract({
    address: token.address as `0x${string}`,
    abi: erc20Abi,
    chainId: Number(chainId),
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  const userBalance = userTokenBalance
    ? formatUnits(userTokenBalance, token.decimals)
    : "0";

  const handleMaxButtonClick = useCallback(() => {
    if (!userBalance) {
      return;
    }
    setAmount(userBalance);
    handleAmountChange(userBalance, token);
  }, [userBalance, setAmount, handleAmountChange, token]);

  const handleChange = useCallback(
    (amount: string) => {
      setAmount(amount);
      handleAmountChange(amount, token);
    },
    [handleAmountChange, setAmount, token]
  );

  const handleSetToken = useCallback(
    (token: Token) => {
      setToken(token);
      handleAmountChange(amount, token);
    },
    [amount, setToken, handleAmountChange]
  );

  const sourceTokenOptions = useMemo(() => {
    return (
      swappableTokens?.filter(
        ({ symbol }: Token) => symbol !== token?.symbol
      ) ?? []
    );
  }, [swappableTokens, token]);

  const hasInsufficientBalance = Number(userBalance) < Number(amount);

  const formatUSD = (amount: string) => {
    if (!amount || amount === "0") {
      return null;
    }
    const roundedAmount = Number(getRoundedAmount(amount, 2));
    return `~$${roundedAmount.toFixed(2)}`;
  };

  return (
    <div
      className={cn(
        background.alternate,
        "box-border flex w-full flex-col items-start",
        "h-[148px] rounded-md p-4",
        className
      )}
      data-testid="ockSwapAmountInput_Container"
    >
      <div className="flex w-full items-center justify-between">
        <span className={cn(text.label2, color.foregroundMuted)}>{label}</span>
      </div>
      <div className="flex w-full items-center justify-between">
        <TextInput
          className={cn(
            "mr-2 w-full border-[none] bg-transparent font-display text-[2.5rem]",
            "leading-none outline-none",
            hasInsufficientBalance && address ? color.error : color.foreground
          )}
          placeholder="0.0"
          delayMs={delayMs}
          value={amount}
          setValue={setAmount}
          disabled={loading}
          onChange={handleChange}
          inputValidator={isValidAmount}
        />
        {/* {sourceTokenOptions.length > 0 ? (
          <TokenSelectDropdown
            token={token}
            setToken={handleSetToken}
            options={sourceTokenOptions}
          />
        ) : (
          token && <TokenChip className={pressable.inverse} token={token} />
        )} */}
        <TokenChip token={token} />
      </div>
      <div className="mt-4 flex w-full justify-between">
        {/* <div className="flex items-center">
          <span className={cn(text.label2, color.foregroundMuted)}>
            {formatUSD(amountUSD)}
          </span>
        </div> */}
        <div className="flex items-center">
          {userBalance && (
            <span
              className={cn(text.label2, color.foregroundMuted)}
            >{`Balance: ${getRoundedAmount(userBalance, 10)}`}</span>
          )}
          {address && (
            <button
              type="button"
              className="flex cursor-pointer items-center justify-center px-2 py-1"
              data-testid="ockSwapAmountInput_MaxButton"
              onClick={handleMaxButtonClick}
            >
              <span className={cn(text.label1, color.primary)}>Max</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
