export interface ServerToClientEvents {
    "user-joined": (userId: string) => void;
    "signal": (payload: SignalPayload) => void;
    "room-full": () => void;
  }
  
  export interface ClientToServerEvents {
    "join-room": (roomId: string) => void;
    "signal": (payload: SignalPayload) => void;
    "create-room": (roomId: string) => void;
  }
  
  export interface SignalPayload {
    target: string;
    sender?: string;
    signal: any; // We use 'any' here because SimplePeer signal objects are complex
  }