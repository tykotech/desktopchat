// src/features/knowledge/FileProcessorTest.tsx
import React, { useState } from "react";
import { useTauriMutation } from "../../hooks/useTauriMutation";

interface FileProcessorTestProps {
  knowledgeBaseId: string;
}

const FileProcessorTest: React.FC<FileProcessorTestProps> = ({ knowledgeBaseId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string>("");
  
  const uploadMutation = useTauriMutation("upload_file");
  const addFileMutation = useTauriMutation("add_file_to_knowledge_base");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      // In a real Tauri application, we would use the Tauri dialog API to select a file
      // For demonstration purposes, we'll create a temporary file path
      
      // In a real implementation, we would:
      // 1. Use Tauri's dialog API to select a file: await open({ multiple: false })
      // 2. Get the actual file path from the dialog result
      // 3. Pass that path to the backend
      
      // Create a temporary file path for demonstration
      const tempFilePath = `/tmp/${selectedFile.name}`;
      const fileName = selectedFile.name;
      
      uploadMutation.mutate(
        { filePath: tempFilePath, fileName },
        {
          onSuccess: (file: any) => {
            setFileId(file.id);
          }
        }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleProcess = () => {
    if (!fileId || !knowledgeBaseId) return;
    
    addFileMutation.mutate({ kbId: knowledgeBaseId, fileId });
  };

  return (
    <div className="bg-gray-750 rounded-lg p-6 mt-6">
      <h3 className="text-lg font-medium mb-4">Test File Processing</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select a file to upload
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700"
          />
        </div>
        
        {selectedFile && (
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <div>
              <div className="font-medium">{selectedFile.name}</div>
              <div className="text-sm text-gray-400">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </div>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}
        
        {fileId && (
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <div>
              <div className="font-medium">File uploaded successfully</div>
              <div className="text-sm text-gray-400">ID: {fileId}</div>
            </div>
            <button
              onClick={handleProcess}
              disabled={addFileMutation.isPending}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {addFileMutation.isPending ? "Processing..." : "Process File"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileProcessorTest;