// src/features/assistants/AssistantList.tsx
import React from "react";
import AssistantCard from "./AssistantCard";

interface Assistant {
  id: string;
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  createdAt: string;
}

interface AssistantListProps {
  assistants: Assistant[];
  onSelectAssistant?: (id: string) => void;
  onEditAssistant?: (id: string) => void;
}

const AssistantList: React.FC<AssistantListProps> = ({ assistants, onSelectAssistant, onEditAssistant }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Assistants</h2>
      </div>
      
      {assistants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assistants.map((assistant) => (
            <AssistantCard 
              key={assistant.id} 
              assistant={assistant} 
              onSelect={() => onSelectAssistant?.(assistant.id)}
              onEdit={() => onEditAssistant?.(assistant.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No assistants created yet</div>
        </div>
      )}
    </div>
  );
};

export default React.memo(AssistantList);