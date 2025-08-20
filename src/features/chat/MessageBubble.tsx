// src/features/chat/MessageBubble.tsx
import React from "react";

interface Message {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-3xl rounded-2xl px-4 py-3 ${
          message.role === "user"
            ? "bg-blue-600 rounded-tr-none"
            : "bg-gray-700 rounded-tl-none"
        }`}
      >
        <div className="prose prose-invert">
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;