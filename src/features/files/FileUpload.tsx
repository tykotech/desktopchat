// src/features/files/FileUpload.tsx
import React, { useState } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { useTauriMutation } from '../../hooks/useTauriMutation';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  interface SelectedFile {
    path: string;
    name: string;
    size?: number;
  }

  const [file, setFile] = useState<SelectedFile | null>(null);
  
  const uploadMutation = useTauriMutation('upload_file');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = e.dataTransfer.files[0] as unknown as { path?: string; name: string; size: number };
      const filePath = dropped.path || dropped.name;
      const dropped = e.dataTransfer.files[0];
      if (isSelectedFileLike(dropped)) {
        const filePath = dropped.path || dropped.name;
        setFile({ path: filePath, name: dropped.name, size: dropped.size });
      } else {
        // fallback: use name and size, path may not be available
        setFile({ path: dropped.name, name: dropped.name, size: dropped.size });
      }
    }
  };

  const handleSelectFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Documents', extensions: ['txt', 'pdf', 'md'] }]
      });
      if (typeof selected === 'string') {
        const parts = selected.split(/\\|\//);
        const name = parts[parts.length - 1];
        setFile({ path: selected, name });
      }
    } catch (err) {
      console.error('Error selecting file:', err);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['txt', 'pdf', 'md'].includes(ext)) {
      console.error('Unsupported file type:', ext);
      return;
    }

    try {
      uploadMutation.mutate(
        { filePath: file.path, fileName: file.name },
        {
          onSuccess: () => {
            setFile(null);
            onUploadSuccess();
          }
        }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Upload File</h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-900' : 'border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSelectFile}
      >
        
        {file ? (
          <div>
            <p className="text-lg font-medium">{file.name}</p>
            <p className="text-gray-400">{file.size ? `${(file.size / 1024).toFixed(2)} KB` : ''}</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium mb-2">Drag and drop a file here</p>
            <p className="text-gray-400 mb-4">or click to select a file</p>
            <button
              type="button"
              onClick={handleSelectFile}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Select File
            </button>
          </div>
        )}
      </div>
      
      {file && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;