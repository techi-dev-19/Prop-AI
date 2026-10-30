import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore.js";

// Same server as the API (VITE_API_BASE_URL without /api), or VITE_SOCKET_URL if set.
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/").replace(/\/api\/?$/, "");

let socket = null;

export function getSocket() {
  if (socket) return socket;
  socket = io(SOCKET_URL, {
    // Function form: har (re)connect par ABHI ka access token jata hai.
    // (Pehle token ek baar fix ho jata tha; 15 min baad expire hone par
    // reconnect fail ho jata tha.)
    auth: (cb) => cb({ token: useAuthStore.getState().accessToken }),
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
