// src/features/assistants/AssistantEditor.tsx
import React, { useState } from 'react';
import { Assistant } from '../../api/assistants';
import { KnowledgeBase } from '../../api/knowledge';
import { useTauriMutation } from '../../hooks/useTauriMutation';
import { useTauriQuery } from '../../hooks/useTauriQuery';

interface AssistantEditorProps {
  assistant?: Assistant;
  onSave: () => void;
  onCancel: () => void;
}

const AssistantEditor: React.FC<AssistantEditorProps> = ({ assistant, onSave, onCancel }) => {
  const [name, setName] = useState(assistant?.name || '');
  const [description, setDescription] = useState(assistant?.description || '');
  const [model, setModel] = useState(assistant?.model || 'gpt-4');
  const [systemPrompt, setSystemPrompt] = useState(assistant?.systemPrompt || '');
  const [nameError, setNameError] = useState('');


  const createMutation = useTauriMutation('create_assistant');
  const updateMutation = useTauriMutation('update_assistant');

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Name is required');
      return;
    } else {
      setNameError('');
    }

    const config: AssistantConfig = {
      name: trimmedName,
      description: description.trim(),
      model,
      systemPrompt: systemPrompt.trim()

    const payload = {
      name,
      description,
      model,
      systemPrompt,
      knowledgeBaseIds: selectedKnowledgeBases,

    };

    if (assistant) {
      updateMutation.mutate(
        { assistantId: assistant.id, ...payload },
        {
          onSuccess: () => {
            onSave();
          }
        }
      );
    } else {
      createMutation.mutate(
        payload,
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
        {assistant ? 'Edit Assistant' : 'Create New Assistant'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="assistant-name">
            Name
          </label>
          <input
            id="assistant-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-required="true"
            aria-invalid={nameError ? "true" : "false"}
            aria-describedby={nameError ? "name-error" : undefined}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {nameError && (
            <p id="name-error" className="text-red-500 text-sm mt-1">
              {nameError}
            </p>
          )}
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
            Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="claude-3-opus">Claude 3 Opus</option>
            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            System Prompt
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Knowledge Bases</label>
          <div className="space-y-2">
            {knowledgeBases && knowledgeBases.length > 0 ? (
              knowledgeBases.map((kb) => (
                <label key={kb.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedKnowledgeBases.includes(kb.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedKnowledgeBases([...selectedKnowledgeBases, kb.id]);
                      } else {
                        setSelectedKnowledgeBases(selectedKnowledgeBases.filter(id => id !== kb.id));
                      }
                    }}
                  />
                  <span>{kb.name}</span>
                </label>
              ))
            ) : (
              <div className="text-gray-400">No knowledge bases available</div>
            )}
          </div>
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
            {isLoading ? 'Saving...' : (assistant ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssistantEditor;