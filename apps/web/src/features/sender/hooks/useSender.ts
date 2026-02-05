import { useState, useEffect, useRef, useCallback } from "react";
import SimplePeer from "simple-peer";
import * as fflate from "fflate";
import { socket } from "../../../lib/socket";

export function useSender() {
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState("Initializing...");
  const peerRef = useRef<SimplePeer.Instance | null>(null);

  // 1. Initialize Room on Mount
  useEffect(() => {
    socket.connect();
    
    // Generate a short random ID (e.g., "abc-123")
    const newRoomId = Math.random().toString(36).substring(2, 7);
    setRoomId(newRoomId);
    socket.emit("create-room", newRoomId);
    setStatus("Waiting for mobile to scan...");

    // 2. Listen for Peer Joining
    socket.on("user-joined", (userId) => {
      setStatus("Mobile found! Starting handshake...");
      startP2PConnection(userId);
    });

    socket.on("signal", (payload) => {
      peerRef.current?.signal(payload.signal);
    });

    return () => {
      socket.off("user-joined");
      socket.off("signal");
      socket.disconnect();
    };
  }, []);

  // 3. WebRTC Handshake Logic
  const startP2PConnection = (remoteUserId: string) => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
          // Google's free STUN servers
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      }
    });

    peer.on("signal", (signal) => {
      socket.emit("signal", { target: remoteUserId, signal });
    });

    peer.on("connect", () => {
      setStatus("Connected! Ready to drop files.");
    });

    peerRef.current = peer;
  };

  // 4. File Processing & Streaming Logic
  const sendFiles = useCallback(async (files: FileList | DataTransferItemList) => {
    if (!peerRef.current?.connected) {
      alert("Wait for mobile connection first!");
      return;
    }

    setStatus("Zipping and sending...");
    
    // Create the Zip Stream
    const zip = new fflate.Zip((err, chunk) => {
      if (err) console.error(err);
      if (chunk.length > 0) {
        peerRef.current?.send(chunk);
      }
    });

    // Helper: Recursively read folders
    const processEntry = async (entry: FileSystemEntry, path = "") => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        const file = await new Promise<File>((resolve) => fileEntry.file(resolve));
        
        // Add file to zip
        const fileStream = new fflate.ZipPassThrough(path + file.name);
        zip.add(fileStream);

        // Stream file content
        const reader = file.stream().getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            fileStream.push(new Uint8Array(0), true); // Signal EOF for this file
            break;
          }
          fileStream.push(value);
        }
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const dirReader = dirEntry.createReader();
        const entries = await new Promise<FileSystemEntry[]>((res) => dirReader.readEntries(res));
        for (const subEntry of entries) {
          await processEntry(subEntry, path + entry.name + "/");
        }
      }
    };

    // Process dropped items
    // @ts-ignore - DataTransferItem is standard but TypeScript sometimes complains about webkitGetAsEntry
    for (let i = 0; i < files.length; i++) {
        const item = files[i];
        // Handle DataTransferItem (Drag & Drop) vs File (Input)
        if ('webkitGetAsEntry' in item) {
            const entry = (item as DataTransferItem).webkitGetAsEntry();
            if (entry) await processEntry(entry);
        }
    }

    zip.end();
    setStatus("Transfer Complete!");
  }, []);

  return { roomId, status, sendFiles };
}