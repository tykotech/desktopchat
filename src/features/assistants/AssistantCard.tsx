// src/features/assistants/AssistantCard.tsx
import React from "react";

interface Assistant {
  id: string;
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  createdAt: string;
}

interface AssistantCardProps {
  assistant: Assistant;
  onSelect?: () => void;
  onEdit?: () => void;
}

const AssistantCard: React.FC<AssistantCardProps> = ({ assistant, onSelect, onEdit }) => {
  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-gray-750 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{assistant.name}</h3>
          <span className="bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded">
            {assistant.model}
          </span>
        </div>
        
        <p className="text-gray-300 mb-4">{assistant.description}</p>
        
        <div className="flex justify-between text-sm text-gray-400 mb-4">
          <div>
            <span className="block">Created</span>
            <span className="font-medium">{formatDate(assistant.createdAt)}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={onEdit}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
          >
            Edit
          </button>
          <button 
            onClick={onSelect}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AssistantCard);