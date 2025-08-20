// src/features/files/FileList.tsx
import React from "react";
import FileItem from "./FileItem";

interface ManagedFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  status: string;
  createdAt: string;
}

interface FileListProps {
  files: ManagedFile[];
}

const FileList: React.FC<FileListProps> = ({ files }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Uploaded Files</h2>
      </div>
      
      {files.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3">File</th>
                <th className="pb-3">Size</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <FileItem key={file.id} file={file} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No files uploaded yet</div>
        </div>
      )}
    </div>
  );
};

export default FileList;