// src/features/knowledge/KnowledgeBaseEditor.tsx
import React, { useState } from 'react';
import { useTauriMutation } from '../../hooks/useTauriMutation';
import { KnowledgeBase } from '../../api/knowledge';

interface KnowledgeBaseEditorProps {
  knowledgeBase?: KnowledgeBase;
  onSave: () => void;
  onCancel: () => void;
}

const KnowledgeBaseEditor: React.FC<KnowledgeBaseEditorProps> = ({ knowledgeBase, onSave, onCancel }) => {
  const [name, setName] = useState(knowledgeBase?.name || '');
  const [description, setDescription] = useState(knowledgeBase?.description || '');
  const [embeddingModel, setEmbeddingModel] = useState(knowledgeBase?.embeddingModel || 'text-embedding-3-small');

  const createMutation = useTauriMutation('create_knowledge_base');
  const updateMutation = useTauriMutation('update_knowledge_base');

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (knowledgeBase) {
      // Update existing knowledge base
      updateMutation.mutate(
        { knowledgeBaseId: knowledgeBase.id, name, description, embeddingModel },
        {
          onSuccess: () => {
            onSave();
          }
        }
      );
    } else {
      // Create new knowledge base
      createMutation.mutate(
        { name, description, embeddingModel },
        {
          onSuccess: () => {
            onSave();
          }
        }
      );
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">
        {knowledgeBase ? 'Edit Knowledge Base' : 'Create New Knowledge Base'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Embedding Model
          </label>
          <select
            value={embeddingModel}
            onChange={(e) => setEmbeddingModel(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="text-embedding-3-small">text-embedding-3-small</option>
            <option value="text-embedding-3-large">text-embedding-3-large</option>
            <option value="text-embedding-ada-002">text-embedding-ada-002</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (knowledgeBase ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KnowledgeBaseEditor;