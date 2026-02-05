import { useState, useEffect, useRef } from "react";
import SimplePeer from "simple-peer";
import streamSaver from "streamsaver";
import { socket } from "../../../lib/socket";

export function useReceiver(roomId: string) {
  const [status, setStatus] = useState("Connecting to server...");
  const [progress, setProgress] = useState(0);
  const peerRef = useRef<SimplePeer.Instance | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // 1. Connect and Join Room
    socket.connect();
    socket.emit("join-room", roomId);

    // 2. Handle Signaling (Handshake)
    socket.on("signal", ({ sender, signal }) => {
      if (!sender) {
        console.error("Received signal without sender ID");
        return;
      }
      
      // If we already have a peer, ignore (avoid duplicate connections)
      if (peerRef.current) {
        peerRef.current.signal(signal);
        return;
      }

      setStatus("Handshaking with Desktop...");
      
      const peer = new SimplePeer({
        initiator: false, // Receiver is NOT the initiator
        trickle: false,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });

      peer.on("signal", (data) => {
        socket.emit("signal", { target: sender, signal: data });
      });

      peer.on("connect", () => {
        setStatus("Connected! Waiting for files...");
      });

      // 3. Handle Incoming Data Stream
      // We set up the file writer once the connection opens
      const fileStream = streamSaver.createWriteStream("air-portal-download.zip");
      const writer = fileStream.getWriter();

      peer.on("data", (chunk: Uint8Array) => {
        setStatus("Downloading...");
        writer.write(chunk);
        setProgress((prev) => prev + chunk.length);
      });

      peer.on("close", () => {
        writer.close();
        setStatus("Download Complete!");
      });

      peer.on("error", (err) => {
        console.error(err);
        setStatus("Error: " + err.message);
        writer.abort(err.message);
      });

      peerRef.current = peer;
      // Signal back immediately
      peer.signal(signal);
    });

    return () => {
      socket.off("signal");
      socket.disconnect();
      peerRef.current?.destroy();
    };
  }, [roomId]);

  return { status, progress };
}