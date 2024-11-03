import { BotMessage, UserMessage } from "@/components/blockchain-assistant/chat/messages";

import type { Chat } from "../types";
import { AccountBalanceUI } from "./tools/ui/account-balance-ui";


export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function getUIComponentFromMessage(message: any) {
  if (message.role === "user") {
    return <UserMessage>{message.content}</UserMessage>;
  }

  if (message.role === "assistant" && typeof message.content === "string") {
    return <BotMessage content={message.content} />;
  }

  if (message.role === "tool") {
    return message.content.map((tool: any) => {
      switch (tool.toolName) {
        case "getAccountBalance": {
          return <AccountBalanceUI {...tool.result} />;
        }
        default:
          return null;
      }
    });
  }
}

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState?.messages
    .filter((message) => message.role !== "system")
    .map((message, index) => ({
      id: `${aiState.id}-${index}`,
      display: getUIComponentFromMessage(message),
    }));
};
