import { create } from 'zustand';
import { saveToIndexedDB, getFromIndexedDB } from '@/utils/indexedDB';

export const useHackathonStore = create((set) => ({
    hackathons: [],
    loading: false,
    error: null,

    fetchHackathons: async () => {
        set({ loading: true, error: null });

        // If offline, load from IndexedDB...
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            const cached = await getFromIndexedDB();
            if (cached) {
                set({ hackathons: cached.data, loading: false });
            } else {
                set({ error: 'No internet & no cached data', loading: false });
            }
            return;
        }

        // Online: fetch from backend...
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/hackathons');
            if (!res.ok) throw new Error('Failed to fetch hackathons');
            const response = await res.json();

            set({ hackathons: response.data, loading: false });
            saveToIndexedDB(response.data); // Save to IndexedDB...
        } catch (err) {
            const cached = await getFromIndexedDB();
            set({ hackathons: cached.data, error: err.message, loading: false });
        }
    },

    setHackathons: (hackathons) => {
        set({ hackathons });
    },
}));
