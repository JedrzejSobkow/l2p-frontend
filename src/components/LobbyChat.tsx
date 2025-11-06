import React, { useState, useEffect, useRef } from 'react';
import { BsSend } from 'react-icons/bs';

interface LobbyChatProps {
  messages: { username: string; text: string }[];
  onSendMessage: (message: string) => void;
  onTyping?: () => void;
  typingUsers?: string[];
}

const LobbyChat: React.FC<LobbyChatProps> = ({ messages, onSendMessage, onTyping, typingUsers = [] }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Throttle typing indicator
    if (onTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      onTyping();
      
      typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = null;
      }, 1000);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col w-full h-64 bg-background-secondary rounded-lg shadow-md p-4">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-highlight scrollbar-track-background-tertiary">
        {messages.map((message, index) => (
          <div key={index} className="mb-2 break-words">
            <span className="text-sm font-bold text-highlight break-words">{message.username}: </span>
            <span className="text-sm text-white break-words whitespace-pre-wrap">{message.text}</span>
          </div>
        ))}
        {typingUsers.length > 0 && (
          <div className="mb-2 text-xs text-white/60 italic">
            {typingUsers.length === 1 
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.join(', ')} are typing...`
            }
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-background-tertiary text-white rounded-lg focus:outline-none"
        />
        <button
          onClick={handleSendMessage}
          className="p-2 bg-highlight text-white rounded-lg hover:bg-highlight-dark focus:outline-none"
        >
          <BsSend className="text-xl font-bold" />
        </button>
      </div>
    </div>
  );
};

export default LobbyChat;
