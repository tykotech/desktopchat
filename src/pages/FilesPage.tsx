// src/pages/FilesPage.tsx
import React, { useState } from "react";
import { useTauriQuery } from "../hooks/useTauriQuery";
import FileList from "../features/files/FileList";
import FileUpload from "../features/files/FileUpload";
import { listFiles, type ManagedFile } from "../api/files";

const FilesPage: React.FC = () => {
  const [showUpload, setShowUpload] = useState(false);
  const { data: files, isLoading, error, refetch } = useTauriQuery<ManagedFile[]>("list_files");

  const handleUploadSuccess = () => {
    setShowUpload(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg">Loading files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">Error loading files: {error.message || String(error)}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Files</h1>
        <p className="text-gray-400 mt-1">
          Manage all your uploaded files that can be used in knowledge bases.
        </p>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        {showUpload ? (
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        ) : (
          <>
            <div className="mb-4">
              <button 
                onClick={() => setShowUpload(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
              >
                Upload File
              </button>
            </div>
            <FileList files={files || []} />
          </>
        )}
      </div>
    </div>
  );
};

export default FilesPage;