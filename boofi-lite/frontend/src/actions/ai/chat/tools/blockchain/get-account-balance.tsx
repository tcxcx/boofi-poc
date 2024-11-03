// frontend/src/actions/ai/chat/tools/getAccountBalance.ts

import type { MutableAIState } from "@/actions/ai/types";
import { nanoid } from "nanoid";
import { z } from "zod";
import { AccountBalanceUI } from "../ui/account-balance-ui";

type Args = {
  aiState: MutableAIState;
};

export function getAccountBalanceTool({ aiState }: Args) {
  return {
    description: "Retrieves the current account balance of the connected wallet.",
    parameters: z.object({}),
    generate: async (args: any) => {
      const toolCallId = nanoid();

      // Since we cannot use hooks here, we'll retrieve the balance in the UI component
      // The AI state is updated with the tool call and result
      aiState.done({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            id: nanoid(),
            role: "assistant",
            content: [
              {
                type: "tool-call",
                toolName: "getAccountBalance",
                toolCallId,
                args,
              },
            ],
          },
          {
            id: nanoid(),
            role: "tool",
            content: [
              {
                type: "tool-result",
                toolName: "getAccountBalance",
                toolCallId,
                result: {},
              },
            ],
          },
        ],
      });

      // Return the UI component that will display the balance
      return <AccountBalanceUI />;
    },
  };
}
