import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

export const useTeamStore = create((set, get) => ({
    teams: [],
    loading: true,
    error: null,

    setTeams: (teams) => set({ teams }),
    addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // Create a team
    createTeam: async ({ name, project_description, github_repo }) => {
        const token = useAuthStore.getState().token;
        set({ loading: true, error: null });

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
                body: JSON.stringify({ name, project_description, github_repo }),
            });

            const data = await res.json();
            if (data.success) {
                get().addTeam(data.team);
                return data.team;
            } else {
                set({ error: data.msg || 'Failed to create team' });
                return null;
            }
        } catch (err) {
            console.error('createTeam error:', err);
            set({ error: 'Something went wrong while creating team.' });
            return null;
        } finally {
            set({ loading: false });
        }
    },

    // Join a team by ID (only if not already joined)
    joinTeam: async (teamId) => {
        const token = useAuthStore.getState().token;
        const existing = get().teams.find((team) => team._id === teamId);

        if (existing) {
            return { success: false, msg: 'You are already a member of this team.' };
        }

        set({ loading: true });

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${teamId}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });

            const data = await res.json();
            if (data.success) {
                get().addTeam(data.team);
                return { success: true, team: data.team };
            } else {
                return { success: false, msg: data.msg || 'Failed to join team' };
            }
        } catch (err) {
            console.error('joinTeam error:', err);
            return {
                success: false,
                msg: 'Something went wrong while joining team.',
            };
        } finally {
            set({ loading: false });
        }
    },

    // Fetch all teams
    fetchTeams: async () => {
        const token = useAuthStore.getState().token;
        set({ loading: true, error: null });

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            // console.log(data.my_teams);
            if (data.success) {
                set({ teams: data.my_teams });
            } else {
                set({ error: data.msg || 'Failed to fetch teams.' });
            }
        } catch (err) {
            console.error('fetchTeams error:', err);
            set({ error: 'Something went wrong while fetching teams.' });
        } finally {
            set({ loading: false });
        }
    },
}));
