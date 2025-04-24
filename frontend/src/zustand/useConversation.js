import {create } from "zustand";

const useConversation = create((set) => ({
  selectedConversation: null,
  messages: [],
  
  setSelectedConversation: (selectedConversation) => set((state) => {
    return {
      selectedConversation,
      messages: [] // Clear messages when conversation changes
    };
  }),

  setMessages: (messages) => set({ messages }),
}));

export default useConversation;