// src/features/files/FileUpload.tsx
import React, { useState } from 'react';
import { useTauriMutation } from '../../hooks/useTauriMutation';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
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
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      // In a production Tauri application, we would use:
      // import { open } from '@tauri-apps/api/dialog';
      // const selected = await open({
      //   multiple: false,
      //   filters: [{
      //     name: 'Documents',
      //     extensions: ['txt', 'pdf', 'md']
      //   }]
      // });
      
      // For development simulation, we'll create a temporary file reference
      // In a real implementation, the file would be processed through Tauri's filesystem APIs
      const tempFilePath = file.name; // This would be the actual file path in Tauri
      
      uploadMutation.mutate(
        { filePath: tempFilePath, fileName: file.name },
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
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        
        {file ? (
          <div>
            <p className="text-lg font-medium">{file.name}</p>
            <p className="text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium mb-2">Drag and drop a file here</p>
            <p className="text-gray-400 mb-4">or click to select a file</p>
            <button
              type="button"
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