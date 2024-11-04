import { create } from "zustand";

export interface Message {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  
  toolName?: string;
  result?: any;
}

export interface AssistantState {
  messages: Message[];
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  audioLevel: number;
  setAudioLevel: (level: number) => void;
  input: string;
  setInput: (input: string) => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  messages: [],
  isRecording: false,
  isOpen: false,
  audioLevel: 0,
  input: "",
  setInput: (input) => set({ input }),
  setOpen: (isOpen) => set({ isOpen }),
  clearMessages: () => set({ messages: [] }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setAudioLevel: (level) => set({ audioLevel: level }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));
