// src/features/knowledge/KnowledgeBaseCard.tsx
import React from "react";
import { KnowledgeBase } from "../../api/knowledge";

interface KnowledgeBaseCardProps {
  knowledgeBase: KnowledgeBase;
  onEdit?: () => void;
  onDelete?: () => void;
}

const KnowledgeBaseCard: React.FC<KnowledgeBaseCardProps> = ({ knowledgeBase, onEdit, onDelete }) => {
  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-gray-750 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{knowledgeBase.name}</h3>
          <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded">
            {knowledgeBase.embeddingModel}
          </span>
        </div>
        
        <p className="text-gray-300 mb-4">{knowledgeBase.description}</p>
        
        <div className="flex justify-between text-sm text-gray-400 mb-4">
          <div>
            <span className="block">Created</span>
            <span className="font-medium">{formatDate(knowledgeBase.createdAt)}</span>
          </div>
          <div>
            <span className="block">Vector Size</span>
            <span className="font-medium">{knowledgeBase.vectorSize}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
            >
              Delete
            </button>
          )}
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
            Use
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseCard;