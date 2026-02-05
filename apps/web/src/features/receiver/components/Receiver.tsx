import { useReceiver } from "../hooks/useReceiver";

export default function Receiver() {
  // Extract roomId from URL (e.g., /receive/abc-123 -> abc-123)
  const roomId = window.location.pathname.split("/").pop() || "";
  
  const { status, progress } = useReceiver(roomId);

  // Convert bytes to MB for display
  const mbs = (progress / (1024 * 1024)).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-blue-400">AirPortal Mobile</h1>
        
        <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-xl">
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Status</p>
          <p className="text-xl font-semibold animate-pulse">{status}</p>
        </div>

        {progress > 0 && (
          <div className="space-y-2">
            <div className="text-4xl font-mono font-bold">{mbs} MB</div>
            <p className="text-gray-500">received</p>
          </div>
        )}

        <div className="text-xs text-gray-600 mt-10">
          Room ID: {roomId}
        </div>
      </div>
    </div>
  );
}