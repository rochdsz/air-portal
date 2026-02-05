import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useSender } from "../hooks/useSender";

export default function Sender() {
  const { roomId, status, sendFiles } = useSender();
  
  // Construct the URL the phone needs to visit
  // IMPORTANT: Replace localhost with your computer's Local IP for real testing!
  const shareUrl = `${window.location.origin}/receive/${roomId}`;
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sendFiles(e.dataTransfer.items);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors">
        
        <h1 className="text-3xl font-bold mb-2 text-blue-600">AirPortal</h1>
        <p className="text-sm text-gray-500 mb-6">Drop folders here to send</p>

        {/* QR Code Section */}
        <div className="bg-gray-100 p-4 rounded-lg inline-block mb-6">
        <QRCodeCanvas value={shareUrl} size={180} />
        </div>

        <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-full font-mono text-sm mb-4">
          Room: <span className="font-bold">{roomId}</span>
        </div>

        <div className="text-lg font-semibold animate-pulse">
          {status}
        </div>
        
        <p className="mt-8 text-xs text-gray-400">
          Make sure your phone is on the same Wi-Fi
        </p>
      </div>
    </div>
  );
}