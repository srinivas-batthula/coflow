import { create } from "zustand";

const useMessageStore = create((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => {
      const exists = state.messages.some((m) => m._id === message._id);
      if (exists) return {};
      return { messages: [...state.messages, message] };
    }),
  setError: (error) => set({ error }),
}));

export default useMessageStore;
