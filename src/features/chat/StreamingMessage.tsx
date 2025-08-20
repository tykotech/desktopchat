// src/features/chat/StreamingMessage.tsx
import React, { useState, useEffect } from 'react';
import { useTauriEvent } from '../../hooks/useTauriEvent';

interface StreamingMessageProps {
  sessionId: string;
}

const StreamingMessage: React.FC<StreamingMessageProps> = ({ sessionId }) => {
  const [content, setContent] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useTauriEvent<{ content: string }>(
    `chat-stream-chunk-${sessionId}`,
    (event) => {
      setContent(prev => prev + event.content);
      setIsVisible(true);
    }
  );

  // Reset when session changes
  useEffect(() => {
    setContent('');
    setIsVisible(false);
  }, [sessionId]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
        A
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-lg p-3">
          <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
          <div className="flex space-x-1 mt-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingMessage;