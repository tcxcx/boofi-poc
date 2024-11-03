"use server";

import { BotMessage, SpinnerMessage } from "@/components/blockchain-assistant/chat/messages";
import { openai } from "@ai-sdk/openai";
import { client as RedisClient } from "@midday/kv";
import { getUser } from "@midday/supabase/cached-queries";
import { Ratelimit } from "@upstash/ratelimit";
import {
  createAI,
  createStreamableValue,
  getMutableAIState,
  streamUI,
} from "ai/rsc";
import { startOfMonth, subMonths } from "date-fns";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { getAssistantSettings, saveChat } from "../storage";
import type { AIState, Chat, ClientMessage, UIState } from "../types";
import { getAccountBalanceTool } from "./tools/blockchain/get-account-balance";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(10, "10s"),
  redis: RedisClient,
});

export async function submitUserMessage(
  content: string,
): Promise<ClientMessage> {
  "use server";
  const ip = headers().get("x-forwarded-for");
  const { success } = await ratelimit.limit(ip ?? "");

  const aiState = getMutableAIState<typeof AI>();

  if (!success) {
    aiState.update({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: "assistant",
          content:
            "Not so fast, tiger. You've reached your message limit. Please wait a minute and try again.",
        },
      ],
    });

    return {
      id: nanoid(),
      role: "assistant",
      display: (
        <BotMessage content="Not so fast, tiger. You've reached your message limit. Please wait a minute and try again." />
      ),
    };
  }

  const user = await getUser();
  const teamId = user?.data?.team_id as string;

  const defaultValues = {
    from: subMonths(startOfMonth(new Date()), 12).toISOString(),
    to: new Date().toISOString(),
  };

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: "user",
        content,
      },
    ],
  });

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>;
  let textNode: undefined | React.ReactNode;

  const result = await streamUI({
    model: openai("gpt-4o-mini"),
    initial: <SpinnerMessage />,
    system: `\
    You are a helpful assistant in BooFi who can help users transcat on the blockchain and answer questions about their balances.

    If the user wants their balance \`getAccountBalanceTool\` function.

    Don't return markdown, just plain text.

    Always try to call the functions with default values, otherwise ask the user to respond with parameters.
    Current date is: ${new Date().toISOString().split("T")[0]} \n
    `,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name,
        display: null,
      })),
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue("");
        textNode = <BotMessage content={textStream.value} />;
      }

      if (done) {
        textStream.done();
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: "assistant",
              content,
            },
          ],
        });
      } else {
        textStream.update(delta);
      }

      return textNode;
    },
    tools: {
        getAccountBalance: getAccountBalanceTool({
        aiState,
      }),
   
    },
  });

  return {
    id: nanoid(),
    role: "assistant",
    display: result.value,
  };
}

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
  },
  initialUIState: [],
  onSetAIState: async ({ state, done }) => {
    "use server";

    const settings = await getAssistantSettings();

    const createdAt = new Date();
    const userId = state.user.id;
    const teamId = state.user.team_id;

    const { chatId, messages } = state;

    const firstMessageContent = messages?.at(0)?.content ?? "";
    const title =
      typeof firstMessageContent === "string"
        ? firstMessageContent.substring(0, 100)
        : "";

    const chat: Chat = {
      id: chatId,
      title,
      userId,
      createdAt,
      messages,
      teamId,
    };

    if (done && settings?.enabled) {
      await saveChat(chat);
    }
  },
});
