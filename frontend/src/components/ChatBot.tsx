import { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  onClose: () => void;
}

export function ChatBot({ onClose }: ChatBotProps) {
  const { theme } = useTheme();
  
  // Load messages from localStorage with date check
  const loadMessages = () => {
    try {
      const today = new Date().toDateString();
      const stored = localStorage.getItem('chatbot_messages');
      const storedDate = localStorage.getItem('chatbot_date');
      
      if (stored && storedDate === today) {
        const parsedMessages = JSON.parse(stored);
        // Ensure timestamps are Date objects
        return parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } else {
        // Clear old messages and set new date
        localStorage.removeItem('chatbot_messages');
        localStorage.setItem('chatbot_date', today);
        return [
          {
            id: '1',
            text: 'Hello! I\'m SmartDesk AI Assistant. I can help you with room bookings, building information, and answer questions about the system. How can I assist you today?',
            sender: 'bot',
            timestamp: new Date()
          }
        ];
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Return default message on error
      return [
        {
          id: '1',
          text: 'Hello! I\'m SmartDesk AI Assistant. I can help you with room bookings, building information, and answer questions about the system. How can I assist you today?',
          sender: 'bot',
          timestamp: new Date()
        }
      ];
    }
  };
  
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Save messages to localStorage with error handling
    try {
      localStorage.setItem('chatbot_messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const data = await apiService.sendChatMessage(inputText, 'smartdesk_room_booking');
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'I apologize, but I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I\'m having trouble connecting right now. Please try again in a moment.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        >
          {/* 3D Robot Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center relative shadow-xl">
              {/* Robot Face */}
              <div className="relative">
                {/* Robot Eyes */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                </div>
                {/* Robot Mouth */}
                <div className="w-4 h-1 bg-gray-500 rounded-full mx-auto"></div>
              </div>
              {/* Antenna */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-gray-600"></div>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-pulse border-2 border-gray-800 shadow-lg"></div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px] flex flex-col">
      <div className={`rounded-2xl shadow-2xl border backdrop-blur-xl h-full flex flex-col ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900/95 to-black/95 border-white/20'
          : 'bg-gradient-to-br from-white/95 to-gray-100/95 border-gray-300'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' ? 'border-white/20' : 'border-gray-300'
        }`}>
          <div className="flex items-center gap-3">
            {/* 3D Robot Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-lg flex items-center justify-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center relative">
                  {/* Robot Face */}
                  <div className="relative">
                    {/* Robot Eyes */}
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    </div>
                    {/* Robot Mouth */}
                    <div className="w-3 h-0.5 bg-gray-500 rounded-full mx-auto"></div>
                  </div>
                  {/* Antenna */}
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-gray-600"></div>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-pulse border-2 border-gray-800 shadow-lg"></div>
            </div>
            <div>
              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                SmartDesk AI
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                Online
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-200'
              }`}
            >
              <Minimize2 className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-200'
              }`}
            >
              <X className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : theme === 'dark'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-gray-200 text-gray-900'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 opacity-70 ${
                  message.sender === 'user' ? 'text-white/80' : 
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className={`rounded-2xl px-4 py-2 ${
                theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-white/20' : 'border-gray-300'}`}>
          <div className="flex items-center gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about rooms, bookings..."
              className={`flex-1 resize-none rounded-xl px-3 py-3 text-sm leading-5 border focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] max-h-[120px] overflow-y-hidden scrollbar-hide ${
                theme === 'dark'
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-300'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              rows={1}
              style={{
                height: 'auto',
                minHeight: '48px',
                maxHeight: '120px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}