import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@air-portal/shared";

// 1. Point this to your computer's local IP (e.g., 192.168.1.X) so your phone can reach it.
// If testing only on desktop, 'http://localhost:3000' is fine.
const SERVER_URL = "http://localhost:3000"; 

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  autoConnect: false, // We connect manually when the user enters the page
});