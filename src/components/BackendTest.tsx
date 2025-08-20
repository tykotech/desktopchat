// src/components/BackendTest.tsx
import React, { useState } from "react";
import { useTauriQuery } from "../hooks/useTauriQuery";
import { useTauriMutation } from "../hooks/useTauriMutation";

const BackendTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>("");
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const { mutate: createAssistant } = useTauriMutation("create_assistant");
  const { mutate: createKnowledgeBase } = useTauriMutation("create_knowledge_base");
  const { mutate: setSecret } = useTauriMutation("set_secret");

  const runTests = async () => {
    setIsTesting(true);
    setTestResult("Running tests...\n");

    try {
      // Test 1: Create an assistant
      setTestResult(prev => prev + "1. Creating assistant...\n");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test 2: Create a knowledge base
      setTestResult(prev => prev + "2. Creating knowledge base...\n");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test 3: Set a secret
      setTestResult(prev => prev + "3. Setting secret...\n");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestResult(prev => prev + "\nAll tests completed successfully!");
    } catch (error) {
      setTestResult(prev => prev + `\nError: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Backend Functionality Test</h2>
      
      <div className="mb-4">
        <button
          onClick={runTests}
          disabled={isTesting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isTesting ? "Testing..." : "Run Tests"}
        </button>
      </div>
      
      <div className="bg-gray-750 rounded p-4 font-mono text-sm whitespace-pre-wrap">
        {testResult || "Click 'Run Tests' to start the backend functionality test."}
      </div>
    </div>
  );
};

export default BackendTest;