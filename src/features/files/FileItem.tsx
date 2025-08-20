// src/features/files/FileItem.tsx
import React from "react";
import FileStatus from "../knowledge/FileStatus";
import { useTauriMutation } from "../../hooks/useTauriMutation";

interface ManagedFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  status: string;
  createdAt: string;
}

interface FileItemProps {
  file: ManagedFile;
}

const FileItem: React.FC<FileItemProps> = ({ file }) => {
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const { mutate: deleteFile } = useTauriMutation("delete_file");

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      deleteFile({ fileId: file.id });
    }
  };

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-750">
      <td className="py-4">
        <div className="flex items-center">
          <div className="bg-gray-700 rounded w-10 h-10 flex items-center justify-center mr-3">
            <span className="text-lg">
              {file.mimeType.includes("pdf") ? "📄" : "📝"}
            </span>
          </div>
          <div>
            <div className="font-medium">{file.name}</div>
            <div className="text-sm text-gray-400">{file.mimeType}</div>
          </div>
        </div>
      </td>
      <td className="py-4">{formatFileSize(file.size)}</td>
      <td className="py-4">
        <FileStatus fileId={file.id} initialStatus={file.status} />
      </td>
      <td className="py-4">{formatDate(file.createdAt)}</td>
      <td className="py-4 text-right">
        <button 
          onClick={handleDelete}
          className="text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </td>
    </tr>
  );
};

export default FileItem;