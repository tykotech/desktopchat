// src/features/chat/SessionSidebar.tsx
import React, { useEffect } from "react";
import { useChatStore } from "../../stores/chatStore";

interface SessionSidebarProps {
  assistantId: string;
}

const SessionSidebar: React.FC<SessionSidebarProps> = ({ assistantId }) => {
  const {
    sessions,
    activeSessionId,
    loadSessions,
    loadMessages,
    setActiveSessionId,
  } = useChatStore();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const filteredSessions = sessions.filter(
    (s) => s.assistantId === assistantId,
  );

  return (
    <div className="w-64 border-r border-gray-700 overflow-y-auto">
      {filteredSessions.map((session) => (
        <button
          key={session.id}
          onClick={() => {
            setActiveSessionId(session.id);
            loadMessages(session.id);
          }}
          className={`block w-full text-left px-4 py-2 hover:bg-gray-700 ${
            activeSessionId === session.id ? "bg-gray-700" : ""
          }`}
        >
          {session.title}
        </button>
      ))}
    </div>
  );
};

export default SessionSidebar;
