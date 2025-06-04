// stores/messageStore.js
import { create } from "zustand";

const useMessageStore = create((set) => ({
  messages: [], // Store messages as an array
  isLoading: false, // Track if messages are being loaded
  error: null, // Store error message if any

  // Action to set loading state
  setLoading: (loading) => set({ isLoading: loading }),

  // Action to set messages in the store
  setMessages: (messages) => set({ messages }),

  // Action to add a new message to the store
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  // Action to set error message
  setError: (error) => set({ error }),
}));
export default useMessageStore;
