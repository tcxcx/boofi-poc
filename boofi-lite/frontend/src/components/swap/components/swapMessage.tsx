import { cn, text } from "../styles/theme";

export function SwapMessage({ className, message }: any) {
  return (
    <div
      className={cn("flex h-7 pt-2", text.label2, className)}
      data-testid="ockSwapMessage_Message"
    >
      {message}
    </div>
  );
}
