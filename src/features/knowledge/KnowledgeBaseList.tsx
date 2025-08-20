// src/features/knowledge/KnowledgeBaseList.tsx
import React, { useState } from "react";
import KnowledgeBaseCard from "./KnowledgeBaseCard";
import KnowledgeBaseFiles from "./KnowledgeBaseFiles";
import KnowledgeBaseEditor from "./KnowledgeBaseEditor";
import { useTauriMutation } from "../../hooks/useTauriMutation";
import { KnowledgeBase } from "../../api/knowledge";

interface KnowledgeBaseListProps {
  knowledgeBases: KnowledgeBase[];
  onChange?: () => void;
}

const KnowledgeBaseList: React.FC<KnowledgeBaseListProps> = ({ knowledgeBases, onChange }) => {
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKnowledgeBase, setEditingKnowledgeBase] = useState<KnowledgeBase | null>(null);

  const deleteMutation = useTauriMutation("delete_knowledge_base");

  const handleSave = () => {
    setIsEditing(false);
    setEditingKnowledgeBase(null);
    onChange?.();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingKnowledgeBase(null);
  };

  const handleEdit = (kb: KnowledgeBase) => {
    setEditingKnowledgeBase(kb);
    setIsEditing(true);
  };

  const handleDelete = (kb: KnowledgeBase) => {
    if (!confirm(`Delete knowledge base "${kb.name}"?`)) return;
    deleteMutation.mutate(
      { kbId: kb.id } as any,
      {
        onSuccess: () => {
          if (selectedKnowledgeBase?.id === kb.id) {
            setSelectedKnowledgeBase(null);
          }
          onChange?.();
        }
      }
    );
  };
    setKbToDelete(kb);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!kbToDelete) return;
    deleteMutation.mutate(
      { kbId: kbToDelete.id } as any,
      {
        onSuccess: () => {
          if (selectedKnowledgeBase?.id === kbToDelete.id) {
            setSelectedKnowledgeBase(null);
          }
          setShowDeleteModal(false);
          setKbToDelete(null);
          onChange?.();
        }
      }
    );
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setKbToDelete(null);
  };

  // If we're creating a new knowledge base, show the editor
  if (isEditing) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <KnowledgeBaseEditor 
          knowledgeBase={editingKnowledgeBase || undefined} 
          onSave={handleSave} 
          onCancel={handleCancel} 
        />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Knowledge Base List */}
      <div className={`bg-gray-800 rounded-lg p-6 ${selectedKnowledgeBase ? 'w-1/3' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Knowledge Bases</h2>
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            Create Knowledge Base
          </button>
        </div>
        
        {knowledgeBases.length > 0 ? (
          <div className="space-y-4">
            {knowledgeBases.map((kb) => (
              <div 
                key={kb.id} 
                className={`cursor-pointer ${selectedKnowledgeBase?.id === kb.id ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
                onClick={() => setSelectedKnowledgeBase(selectedKnowledgeBase?.id === kb.id ? null : kb)}
              >
                <KnowledgeBaseCard
                  knowledgeBase={kb}
                  onEdit={() => handleEdit(kb)}
                  onDelete={() => handleDelete(kb)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No knowledge bases created yet</div>
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
            >
              Create Your First Knowledge Base
            </button>
          </div>
        )}
      </div>

      {/* Knowledge Base Details */}
      {selectedKnowledgeBase && (
        <div className="w-2/3 pl-6">
          <div className="bg-gray-800 rounded-lg p-6 h-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedKnowledgeBase.name}</h2>
                <p className="text-gray-300 mt-2">{selectedKnowledgeBase.description}</p>
              </div>
              <button 
                onClick={() => setSelectedKnowledgeBase(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-750 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Embedding Model</div>
                <div className="font-medium">{selectedKnowledgeBase.embeddingModel}</div>
              </div>
              <div className="bg-gray-750 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Vector Size</div>
                <div className="font-medium">{selectedKnowledgeBase.vectorSize}</div>
              </div>
            </div>
            
            <KnowledgeBaseFiles knowledgeBaseId={selectedKnowledgeBase.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseList;