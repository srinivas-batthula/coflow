"use client";
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
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
      set({ user: data.user, token: data.token, loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // Signup action
  signup: async (firstName, lastName, email, password, otp) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, otp }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.msg || "Signup failed");
      set({ user: data.user, token: data.token, loading: false });
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
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // Validate user action
  validateUser: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(
        "http://localhost:8080/api/auth/validateUser?q=true",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success && data.auth && data.user) {
        set({ user: data.user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (err) {
      set({ user: null, error: err.message, loading: false });
    }
  },
}));
