// src/features/agents/AgentCard.tsx
import React from "react";

interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

interface AgentCardProps {
  agent: Agent;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center mr-4">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{agent.name}</h3>
            <p className="text-sm text-gray-400">Agent</p>
          </div>
        </div>
        
        <p className="text-gray-300 mb-4">{agent.description}</p>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Capabilities</h4>
          <div className="flex flex-wrap gap-2">
            {agent.capabilities.map((capability, index) => (
              <span 
                key={index} 
                className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded"
              >
                {capability}
              </span>
            ))}
          </div>
        </div>
        
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
          Use Agent
        </button>
      </div>
    </div>
  );
};

export default AgentCard;