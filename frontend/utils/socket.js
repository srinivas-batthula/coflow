// utils/socket.js
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
  withCredentials: true,
  auth: {
    token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  },
  extraHeaders: {
    Authorization: `Bearer ${ typeof window !== "undefined" ? localStorage.getItem("token") : null }`,
  },
  autoConnect: false,     // Disable `autConnection` in SSR...
  transports: ["websocket", "polling"],
  reconnectionAttempts: 3,
  reconnectionDelay: 1000,
});

export default socket;