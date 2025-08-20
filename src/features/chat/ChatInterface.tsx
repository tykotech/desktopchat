// src/features/chat/ChatInterface.tsx
import React, { useState, useRef, useEffect } from "react";
import { useTauriQuery } from "../../hooks/useTauriQuery";
import { useTauriMutation } from "../../hooks/useTauriMutation";
import MessageBubble from "./MessageBubble";
import StreamingMessage from "./StreamingMessage";
import { useChatStore } from "../../stores/chatStore";
import { Assistant, MessagePayload } from "../../api/assistant";

interface ChatInterfaceProps {
  assistantId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ assistantId }) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatStore = useChatStore();
  const { messages, activeSessionId, streamingContent, isAssistantThinking } = chatStore;
  
  const setMessages = chatStore.addMessage;
  const setStreaming = chatStore.setStreamingContent;
  const setActiveSessionId = chatStore.setActiveSessionId;
  
  const { data: assistant } = useTauriQuery<Assistant>("get_assistant", { assistantId });
  const startChatSessionMutation = useTauriMutation("start_chat_session");
  const sendMessageMutation = useTauriMutation("send_message");

  // Start a new chat session when assistantId changes
  useEffect(() => {
    if (assistantId && !activeSessionId) {
      startChatSessionMutation.mutate(
        { assistantId },
        {
          onSuccess: (session: any) => {
            // Set the active session
            setActiveSessionId(session.id);
          },
        }
      );
    }
  }, [assistantId, activeSessionId, startChatSessionMutation, setActiveSessionId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || !activeSessionId) return;

    // Add user message to UI immediately
    const userMessage = {
      id: Date.now().toString(),
      sessionId: activeSessionId,
      role: "user" as const,
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(userMessage);
    setInputValue("");

    // Set streaming state
    setStreaming("");

    // Send message to backend
    sendMessageMutation.mutate(
      { sessionId: activeSessionId, message: { content: inputValue, role: "user" } as MessagePayload },
      {
        onSuccess: () => {
          // Streaming will be handled by events
        },
        onError: () => {
          setStreaming("");
        }
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b border-gray-700 p-4">
        <h2 className="text-lg font-semibold">{assistant?.name || "Chat"}</h2>
        {assistant?.description && (
          <p className="text-sm text-gray-400 mt-1">{assistant.description}</p>
        )}
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {activeSessionId && <StreamingMessage sessionId={activeSessionId} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || !activeSessionId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;