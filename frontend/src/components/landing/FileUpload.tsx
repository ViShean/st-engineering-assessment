import React, { useState, useRef } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress?: number; // 0-100
  processProgress?: number; // 0-100
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isUploading,
  uploadProgress = 0,
  processProgress = 0,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
        ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
        ${isUploading ? "opacity-100 pointer-events-none" : ""}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onFileSelect(e.target.files[0]);
            e.target.value = ""; // Reset input so the same file can be selected again
          }
        }}
        className="hidden"
        accept=".csv"
      />

      <div className="space-y-4">
        <div className="text-4xl">📁</div>
        <p className="text-lg font-medium">
          {isUploading
            ? "Uploading & Processing CSV"
            : "Drag & drop your CSV here"}
        </p>
        <p className="text-sm text-gray-500">
          {!isUploading
            ? "or click to browse your computer"
            : "Progress shown separately below"}
        </p>

        {(isUploading || processProgress > 0) && (
          <div className="mt-4 space-y-3 text-left">
            <div>
              <div className="mb-1 text-xs font-semibold text-gray-600">
                Upload
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, uploadProgress))}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {Math.round(uploadProgress)}%
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs font-semibold text-gray-600">
                Processing
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, processProgress))}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {Math.round(processProgress)}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
