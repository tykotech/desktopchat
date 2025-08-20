// src/components/TestStatus.tsx
import React from 'react';

type Status = 'success' | 'error' | null;

interface TestStatusProps {
  status: Status;
  successMessage?: string;
  errorMessage?: string;
}

const TestStatus: React.FC<TestStatusProps> = ({
  status,
  successMessage = 'Connection successful!',
  errorMessage = 'Connection failed.',
}) => {
  if (!status) return null;
  return (
    <div
      className={`px-3 py-2 rounded text-sm ${
        status === 'success'
          ? 'bg-green-900 text-green-200'
          : 'bg-red-900 text-red-200'
      }`}
    >
      {status === 'success' ? successMessage : errorMessage}
    </div>
  );
};

export default TestStatus;
