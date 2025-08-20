// src/features/agents/AgentList.tsx
import React from "react";
import AgentCard from "./AgentCard.tsx";
interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

interface AgentListProps {
  agents: Agent[];
}

const AgentList: React.FC<AgentListProps> = ({ agents }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Available Agents</h2>
      </div>

      {agents.length > 0
        ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
          </div>
        )
        : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No agents available</div>
          </div>
        )}
    </div>
  );
};

export default AgentList;
