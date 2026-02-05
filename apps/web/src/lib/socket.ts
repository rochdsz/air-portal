import { io } from "socket.io-client";

const SERVER_URL = "https://air-portal-server.onrender.com"; 

export const socket = io(SERVER_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"], 
});