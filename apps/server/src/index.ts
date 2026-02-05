import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { 
  ClientToServerEvents, 
  ServerToClientEvents, 
  SignalPayload 
} from "@air-portal/shared";

const app = express();
app.use(cors());

const httpServer = createServer(app);

// Initialize Socket.io with our shared types
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "*", // Allow connections from your Vite frontend
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Desktop creates a room
  socket.on("create-room", (roomId) => {
    socket.join(roomId);
    console.log(`Room created: ${roomId} by ${socket.id}`);
  });

  // 2. Mobile joins the room
  socket.on("join-room", (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    
    if (!room || room.size === 0) {
      // You might want to emit an error here if room doesn't exist
      console.log(`Attempt to join empty room: ${roomId}`);
      return;
    }

    socket.join(roomId);
    // Notify the creator (Desktop) that someone joined
    socket.to(roomId).emit("user-joined", socket.id);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // 3. Relay Signals (Offer/Answer/ICE Candidates)
  socket.on("signal", ({ target, signal }: SignalPayload) => {
    io.to(target).emit("signal", { 
      sender: socket.id, 
      target,
      signal 
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 AirPortal Signaling Server running on port ${PORT}`);
});
