// src/pages/AgentsPage.tsx
import React from "react";
import { useTauriQuery } from "../hooks/useTauriQuery";
import AgentCard from "../features/agents/AgentCard";
import { listAgents, type Agent } from "../api/agents";

const AgentsPage: React.FC = () => {
  const { data: agents, isLoading, error } = useTauriQuery<Agent[]>("list_agents");

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg">Loading agents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">Error loading agents: {error.message || String(error)}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Agents</h1>
        <p className="text-gray-400 mt-1">
          Manage and utilize a roster of pre-defined and custom agents for various tasks.
        </p>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        {agents && agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center max-w-md">
              <h3 className="text-xl font-semibold mb-2">No agents available</h3>
              <p className="text-gray-400">
                Agents will appear here once they are configured. Agents are specialized tools that can perform specific tasks.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentsPage;