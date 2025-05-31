// utils/socket.js
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket", "polling"],
});
export default socket;
