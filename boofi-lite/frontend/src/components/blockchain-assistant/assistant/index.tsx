"use client";

import React, { useState } from "react";
import { Chat } from "@/components/blockchain-assistant/chat";
import { useAssistantStore } from "@/store/assistantStore";
import { nanoid } from "nanoid";
import { useHotkeys } from "react-hotkeys-hook";
import BooFiGhostCard from "@/components/blockchain-assistant/boofi-ghost-card";
import { Separator } from "@/components/ui/separator";
import useRealtimeClient from '@/hooks/realtime-open-ai/use-realtime-client';
import { useRealtimeHandlers } from '@/hooks/realtime-open-ai/use-realtime-handlers';
import useAudioStreaming from '@/hooks/realtime-open-ai/use-audio-streaming';
import { ClientMessage } from "@/actions/ai/types";

export function Assistant() {
  const [input, setInput] = useState<string>("");

  const { messages, addMessage, clearMessages } = useAssistantStore();
  const { wavRecorder, wavStreamPlayer } = useAudioStreaming();
  const { getClient, isReady } = useRealtimeClient();

  useRealtimeHandlers(getClient(), wavStreamPlayer);

  const formattedMessages: ClientMessage[] = messages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    display: <div>{msg.content}</div>,
  }));

  const handleSendMessage = async (input: string) => {
    if (input.trim().length === 0) return;

    const client = getClient();

    addMessage({
      id: nanoid(),
      role: "user",
      content: input,
    });

    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: input,
      },
    ]);

    setInput("");
  };

  const onNewChat = () => {
    clearMessages();
    setInput("");
  };

  useHotkeys("meta+j", () => onNewChat(), {
    enableOnFormTags: true,
  });

  return (
    <div className="flex h-screen overflow-hidden justify-center items-center bg-background">
      {/* Left panel with BooFiGhostCard */}
      <div className="w-1/4 p-4 flex items-center justify-center">
        <BooFiGhostCard />
      </div>
      <Separator orientation="vertical" className="m-4" />

      {/* Right panel with chat */}
      <div className="flex-1 w-full h-full px-10 dark:bg-background bg-background overflow-auto">
        <div className="overflow-hidden p-0 h-full w-full md:max-w-5xl md:h-3xl">
          <Chat
            messages={formattedMessages}
            submitMessage={handleSendMessage}
            onNewChat={onNewChat}
            input={input}
            setInput={setInput}
          />
        </div>
      </div>
    </div>
  );
}
