"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon, Video, AlertCircle } from "lucide-react";
import { validateFile } from "@/types";

interface StepC_MediaCaptureProps {
  files: File[];
  onChange: (files: File[]) => void;
  hasActiveSafetyConcerns: boolean;
}

const UPLOAD_PROMPTS = [
  {
    id: "wide",
    label: "Wide Shot",
    description: "Step back and show the overall area",
    icon: ImageIcon,
  },
  {
    id: "close",
    label: "Close Up",
    description: "Get close to show the damage detail",
    icon: ImageIcon,
  },
  {
    id: "video",
    label: "Video Pan (Optional)",
    description: "Pan around to show context",
    icon: Video,
    optional: true,
  },
];

export function StepC_MediaCapture({
  files,
  onChange,
  hasActiveSafetyConcerns,
}: StepC_MediaCaptureProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = (newFiles: FileList | null) => {
    if (!newFiles) return;

    setUploadError(null);
    const fileArray = Array.from(newFiles);

    // Validate each file
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || "Invalid file");
        return;
      }
    }

    // Add to existing files (max 10 total)
    const combined = [...files, ...fileArray];
    if (combined.length > 10) {
      setUploadError("Maximum 10 files allowed");
      return;
    }

    onChange(combined);
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      {/* Safety reminder if concerns exist */}
      {hasActiveSafetyConcerns && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-800 text-sm">
              <strong>Safety Reminder:</strong> Only take photos/videos if it's safe to do
              so. Do not put yourself at risk.
            </p>
          </div>
        </div>
      )}

      {/* Upload Prompts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {UPLOAD_PROMPTS.map((prompt) => {
          const Icon = prompt.icon;
          return (
            <div
              key={prompt.id}
              className="border border-gray-300 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-start gap-3 mb-2">
                <Icon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {prompt.label}
                    {prompt.optional && (
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        (Optional)
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600">{prompt.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragOver
            ? "border-blue-600 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-700 mb-2">
          Drag and drop files here
        </p>
        <p className="text-sm text-gray-500 mb-4">
          or click the button below to browse
        </p>
        <label className="inline-block">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <span className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
            Choose Files
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-4">
          Supports: JPG, PNG, GIF, WebP, MP4, WebM, MOV (max 10MB images, 100MB videos)
        </p>
      </div>

      {/* Error Display */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{uploadError}</p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Uploaded Files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file, index) => {
              const isVideo = file.type.startsWith("video/");
              const previewUrl = isVideo ? null : URL.createObjectURL(file);

              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-white border border-gray-300 rounded-lg"
                >
                  {/* Preview */}
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {isVideo ? (
                      <Video className="h-8 w-8 text-gray-400" />
                    ) : previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {files.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Tip:</strong> Upload at least 2-3 photos from different angles. This
            helps the contractor understand your issue better and provide more accurate
            estimates.
          </p>
        </div>
      )}
    </div>
  );
}
