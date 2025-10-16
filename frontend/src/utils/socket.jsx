import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL; // Replace with your backend URL

// Create and export the socket instance
export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: false, // manually connect when needed
});