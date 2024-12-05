import { create } from "zustand";

const useConversation = create((set) => ({
  selectedConversation: null,
  messages: [],
  
  setSelectedConversation: (selectedConversation) => set((state) => {
    return {
      selectedConversation,
      messages: [] // Limpia los mensajes cuando cambia la conversación
    };
  }),

  setMessages: (messages) => set({ messages }),
}));


export default useConversation;