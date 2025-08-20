// src/pages/AssistantsPage.tsx
import React, { useState } from "react";
import { useTauriQuery } from "../hooks/useTauriQuery";
import AssistantList from "../features/assistants/AssistantList";
import ChatInterface from "../features/chat/ChatInterface";
import AssistantEditor from "../features/assistants/AssistantEditor";
import { listAssistants, type Assistant } from "../api/assistant";

const AssistantsPage: React.FC = () => {
  const { data: assistants, isLoading, error, refetch } = useTauriQuery<Assistant[]>("list_assistants");
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const selectedAssistant = assistants?.find(a => a.id === selectedAssistantId) || null;

  const handleSave = () => {
    setIsEditing(false);
    refetch();
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg">Loading assistants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">Error loading assistants: {error.message || String(error)}</div>
      </div>
    );
  }

  // If we're creating or editing an assistant, show the editor
  if (isEditing) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Assistants</h1>
          <p className="text-gray-400 mt-1">
            Create, manage, and chat with highly configurable AI assistants.
          </p>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <AssistantEditor 
            assistant={selectedAssistant || undefined} 
            onSave={handleSave} 
            onCancel={handleCancel} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Assistants</h1>
        <p className="text-gray-400 mt-1">
          Create, manage, and chat with highly configurable AI assistants.
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        {assistants && assistants.length > 0 ? (
          <div className="h-full flex">
            <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
              <div className="p-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors mb-4"
                >
                  Create Assistant
                </button>
                <AssistantList 
                  assistants={assistants} 
                  onSelectAssistant={setSelectedAssistantId}
                  onEditAssistant={(id) => {
                    setSelectedAssistantId(id);
                    setIsEditing(true);
                  }}
                />
              </div>
            </div>
            <div className="w-2/3 flex flex-col">
              {selectedAssistantId ? (
                <>
                  <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">
                      {selectedAssistant?.name || "Assistant Chat"}
                    </h2>
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded transition-colors text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {showSettings ? "Hide Settings" : "Show Settings"}
                    </button>
                  </div>
                  <div className="flex-1 flex overflow-hidden">
                    <div className={showSettings ? "w-2/3 border-r border-gray-700" : "w-full"}>
                      <ChatInterface assistantId={selectedAssistantId} />
                    </div>
                    {showSettings && (
                      <div className="w-1/3 p-4 overflow-y-auto bg-gray-800">
                        <h3 className="font-semibold mb-4 text-lg">Assistant Settings</h3>
                        {selectedAssistant && (
                          <div className="space-y-5">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Name
                              </label>
                              <div className="bg-gray-700 px-3 py-2 rounded">
                                {selectedAssistant.name}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Model
                              </label>
                              <div className="bg-gray-700 px-3 py-2 rounded">
                                {selectedAssistant.model}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Description
                              </label>
                              <div className="bg-gray-700 px-3 py-2 rounded min-h-12">
                                {selectedAssistant.description || "No description"}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                System Prompt
                              </label>
                              <div className="bg-gray-700 px-3 py-2 rounded min-h-20">
                                {selectedAssistant.systemPrompt || "No system prompt"}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Knowledge Bases
                              </label>
                              <div className="bg-gray-700 px-3 py-2 rounded">
                                None attached
                              </div>
                            </div>
                            
                            <div className="pt-2">
                              <button
                                onClick={() => {
                                  setIsEditing(true);
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Assistant
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <h3 className="text-xl font-semibold mb-2">Select an Assistant</h3>
                    <p className="text-gray-400">
                      Choose an assistant from the list to start chatting.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <h3 className="text-xl font-semibold mb-2">No assistants created</h3>
              <p className="text-gray-400 mb-6">
                Create your first assistant to start chatting with AI powered by your knowledge bases.
              </p>
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
              >
                Create Assistant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantsPage;