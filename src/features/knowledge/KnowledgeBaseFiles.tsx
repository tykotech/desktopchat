// src/features/knowledge/KnowledgeBaseFiles.tsx
import React, { useState } from "react";
import { useTauriQuery } from "../../hooks/useTauriQuery";
import { useTauriMutation } from "../../hooks/useTauriMutation";
import FileStatus from "./FileStatus";
import FileProcessorTest from "./FileProcessorTest";

interface ManagedFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  status: string;
  createdAt: string;
}

interface KnowledgeBaseFilesProps {
  knowledgeBaseId: string;
}

const KnowledgeBaseFiles: React.FC<KnowledgeBaseFilesProps> = ({ knowledgeBaseId }) => {
  // Fetch files associated with this knowledge base
  const { data: files, isLoading, error, refetch } = useTauriQuery<ManagedFile[]>(
    "list_knowledge_base_files",
    { kbId: knowledgeBaseId }
  );
  const { data: allFiles } = useTauriQuery<ManagedFile[]>("list_files");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [selectedExistingFile, setSelectedExistingFile] = useState<string>("");

  const uploadMutation = useTauriMutation("upload_file");
  const addFileMutation = useTauriMutation("add_file_to_knowledge_base");
  const removeFileMutation = useTauriMutation("remove_file_from_knowledge_base");

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
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
      const tempFilePath = selectedFile.name; // This would be the actual file path in Tauri
      
      uploadMutation.mutate(
        { filePath: tempFilePath, fileName: selectedFile.name },
        {
          onSuccess: (file: any) => {
            setUploadedFileId(file.id);
          }
        }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleProcess = () => {
    if (!uploadedFileId || !knowledgeBaseId) return;
    
    addFileMutation.mutate(
      { kbId: knowledgeBaseId, fileId: uploadedFileId },
      { onSuccess: () => refetch() }
    );
  };

  const handleAddExisting = () => {
    if (!selectedExistingFile) return;
    addFileMutation.mutate(
      { kbId: knowledgeBaseId, fileId: selectedExistingFile },
      {
        onSuccess: () => {
          setSelectedExistingFile("");
          refetch();
        }
      }
    );
  };

  const handleRemove = (fileId: string) => {
    removeFileMutation.mutate(
      { kbId: knowledgeBaseId, fileId },
      { onSuccess: () => refetch() }
    );
  };

  if (isLoading) {
    return <div>Loading files...</div>;
  }

  if (error) {
    console.error("Error loading files:", error);
    return <div>An error occurred while loading files.</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Files in Knowledge Base</h3>
        <div className="flex space-x-2">
          <label className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm cursor-pointer">
            Upload File
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {allFiles && (
            <>
              <select
                value={selectedExistingFile}
                onChange={(e) => setSelectedExistingFile(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
              >
                <option value="">Select file</option>
                {allFiles
                  .filter((f) => !files?.some((kf) => kf.id === f.id))
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
              </select>
              <button
                onClick={handleAddExisting}
                disabled={!selectedExistingFile || addFileMutation.isPending}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                Add
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* File upload section */}
      {selectedFile && (
        <div className="bg-gray-750 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{selectedFile.name}</div>
              <div className="text-sm text-gray-400">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* File processing section */}
      {uploadedFileId && (
        <div className="bg-gray-750 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">File uploaded successfully</div>
              <div className="text-sm text-gray-400">ID: {uploadedFileId}</div>
            </div>
            <button
              onClick={handleProcess}
              disabled={addFileMutation.isPending}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              {addFileMutation.isPending ? "Processing..." : "Process File"}
            </button>
          </div>
        </div>
      )}
      
      {files && files.length > 0 ? (
        <div className="bg-gray-750 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">File</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-700 rounded w-8 h-8 flex items-center justify-center mr-3">
                        <span className="text-sm">
                          {file.mimeType.includes("pdf") ? "📄" : "📝"}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{file.name}</div>
                        <div className="text-sm text-gray-400">{file.mimeType}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatFileSize(file.size)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <FileStatus fileId={file.id} initialStatus={file.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleRemove(file.id)}
                      className="text-red-400 hover:text-red-200"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>No files in this knowledge base yet.</p>
        </div>
      )}
      
      {/* Test file processor */}
      <FileProcessorTest knowledgeBaseId={knowledgeBaseId} />
    </div>
  );
};

export default KnowledgeBaseFiles;