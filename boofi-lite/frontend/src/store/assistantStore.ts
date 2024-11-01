import { create } from "zustand";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface AssistantState {
  isOpen: boolean;
  messages: Message[];
  setOpen: (isOpen: boolean) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  audioLevel: number;
  setAudioLevel: (level: number) => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  isOpen: false,
  messages: [],
  isRecording: false,
  audioLevel: 0,
  setOpen: (isOpen) => set({ isOpen }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setAudioLevel: (level) => set({ audioLevel: level }),
}));
