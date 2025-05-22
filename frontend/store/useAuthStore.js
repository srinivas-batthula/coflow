"use client";
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  teams: [],
  token: null,
  loading: true,
  error: null,

  // Login action
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.msg || "Login failed");
      set({ token: data.token, loading: false });
      typeof window !== "undefined"
        ? localStorage.setItem("login", true)
        : null;
      typeof window !== "undefined"
        ? localStorage.setItem("token", data.token)
        : null;
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // Signup action
  signup: async (fullName, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.msg || "Signup failed");
      set({ token: data.token, loading: false });
      typeof window !== "undefined"
        ? localStorage.setItem("login", true)
        : null;
      typeof window !== "undefined"
        ? localStorage.setItem("token", data.token)
        : null;
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // Logout action
  logout: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Logout failed");
      set({ user: null, token: null, loading: false });
      typeof window !== "undefined"
        ? localStorage.setItem("login", false)
        : null;
      typeof window !== "undefined" ? localStorage.removeItem("token") : null;
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // Validate user action
  validateUser: async (token1) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(
        "http://localhost:8080/api/auth/validateUser?q=true",
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token1}`,
          },
        }
      );
      const data = await res.json();
      if (data.success && data.auth && data.user) {
        set({ user: data.user, loading: false });
        return true;
      } else {
        set({ user: null, loading: false });
        return false;
      }
    } catch (err) {
      set({ user: null, error: err.message, loading: false });
      return false;
    }
  },
  setToken: (token) => {
    set({ token });
  },
  setTeams: (teams) => {
    set({ teams });
  },
}));
