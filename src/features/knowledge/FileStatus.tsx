// src/features/knowledge/FileStatus.tsx
import React, { useState } from 'react';
import { useTauriEvent } from '../../hooks/useTauriEvent';

interface FileStatusProps {
  fileId: string;
  initialStatus: string;
}

const FileStatus: React.FC<FileStatusProps> = ({ fileId, initialStatus }) => {
  const [status, setStatus] = useState(initialStatus);
  const [progress, setProgress] = useState(0);

  useTauriEvent<{ fileId: string; status: string; progress: number }>(
    'file-processing-progress',
    (event) => {
      if (event.fileId === fileId) {
        setStatus(event.status);
        setProgress(event.progress);
      }
    }
  );

  // Map status to display text and styling
  const getStatusDisplay = () => {
    switch (status) {
      case 'PENDING':
        return { text: 'Pending', className: 'bg-gray-200 text-gray-800' };
      case 'PROCESSING':
        return { text: 'Processing', className: 'bg-yellow-200 text-yellow-800' };
      case 'INDEXED':
        return { text: 'Completed', className: 'bg-green-200 text-green-800' };
      case 'ERROR':
        return { text: 'Error', className: 'bg-red-200 text-red-800' };
      default:
        return { text: status, className: 'bg-gray-200 text-gray-800' };
    }
  };

  const { text, className } = getStatusDisplay();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {text}
      {(status === 'PROCESSING' || status === 'INDEXING') && ` (${progress}%)`}
    </span>
  );
};

export default FileStatus;