import { create } from "zustand";

export const useHackathonStore = create((set) => ({
  hackathons: [],
  loading: false,
  error: null,
  fetchHackathons: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("http://localhost:8080/api/hackathons");
      if (!res.ok) throw new Error("Failed to fetch hackathons");
      const response = await res.json();
      set({ hackathons: response.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));
