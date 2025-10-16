import { useState } from 'react';
import { ChatBot } from './ChatBot';

export function ChatBotToggle() {
  const [showChatBot, setShowChatBot] = useState(false);
  const [key, setKey] = useState(0);

  const handleClose = () => {
    setShowChatBot(false);
    // Force re-render with new key to reset ChatBot state
    setTimeout(() => setKey(prev => prev + 1), 100);
  };

  if (showChatBot) {
    return <ChatBot key={key} onClose={handleClose} />;
  }

  return (
    <button
      onClick={() => setShowChatBot(true)}
      className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-110 flex items-center justify-center group"
    >
      {/* 3D Robot Icon */}
      <div className="relative">
        {/* Robot Head */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center relative shadow-lg">
          {/* Robot Eyes */}
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          {/* Robot Mouth */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-gray-500 rounded-full"></div>
          {/* Antenna */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-gray-600"></div>
          <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
        </div>
        {/* Status Indicator */}
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-pulse border-2 border-gray-800 shadow-lg"></div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute right-16 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Ask SmartDesk AI
      </div>
    </button>
  );
}