// src/pages/KnowledgePage.tsx
import React from "react";
import { useTauriQuery } from "../hooks/useTauriQuery";
import KnowledgeBaseList from "../features/knowledge/KnowledgeBaseList";

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  embeddingModel: string;
  vectorSize: number;
  createdAt: string;
}

const KnowledgePage: React.FC = () => {
  const { data: knowledgeBases, isLoading, error, refetch } = useTauriQuery<KnowledgeBase[]>("list_knowledge_bases");

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg">Loading knowledge bases...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">Error loading knowledge bases: {error.message || String(error)}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Knowledge Bases</h1>
        <p className="text-gray-400 mt-1">
          Build and manage vector-based knowledge stores from local files.
        </p>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <KnowledgeBaseList knowledgeBases={knowledgeBases || []} onChange={refetch} />
      </div>
    </div>
  );
};

export default KnowledgePage;