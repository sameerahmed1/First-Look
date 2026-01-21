"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, FileVideo, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadToSupabase } from "@/lib/supabase";
import {
  validateFile,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_VIDEO_TYPES,
  type UploadStatus,
} from "@/types";

interface VideoUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  maxFiles?: number;
}

interface FileWithPreview {
  file: File;
  preview: string;
  uploadStatus: UploadStatus;
}

export function VideoUploader({
  onUploadComplete,
  maxFiles = 5,
}: VideoUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const newFiles: FileWithPreview[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        if (files.length + newFiles.length >= maxFiles) {
          alert(`Maximum ${maxFiles} files allowed`);
          break;
        }

        const file = selectedFiles[i];
        const validation = validateFile(file);

        if (!validation.valid) {
          alert(validation.error);
          continue;
        }

        // Create preview URL
        const preview = URL.createObjectURL(file);

        newFiles.push({
          file,
          preview,
          uploadStatus: {
            isUploading: false,
            progress: 0,
            error: null,
            url: null,
          },
        });
      }

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files.length, maxFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      // Revoke preview URL to prevent memory leak
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    // Update all files to uploading state
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        uploadStatus: { ...f.uploadStatus, isUploading: true, progress: 0 },
      }))
    );

    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];

      // Skip if already uploaded
      if (fileData.uploadStatus.url) {
        uploadedUrls.push(fileData.uploadStatus.url);
        continue;
      }

      try {
        // Simulate progress (Supabase doesn't provide upload progress)
        const progressInterval = setInterval(() => {
          setFiles((prev) => {
            const newFiles = [...prev];
            if (newFiles[i] && newFiles[i].uploadStatus.progress < 90) {
              newFiles[i] = {
                ...newFiles[i],
                uploadStatus: {
                  ...newFiles[i].uploadStatus,
                  progress: newFiles[i].uploadStatus.progress + 10,
                },
              };
            }
            return newFiles;
          });
        }, 200);

        const { url, error } = await uploadToSupabase(fileData.file);

        clearInterval(progressInterval);

        if (error) {
          setFiles((prev) => {
            const newFiles = [...prev];
            newFiles[i] = {
              ...newFiles[i],
              uploadStatus: {
                isUploading: false,
                progress: 0,
                error: error.message,
                url: null,
              },
            };
            return newFiles;
          });
          continue;
        }

        uploadedUrls.push(url);

        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[i] = {
            ...newFiles[i],
            uploadStatus: {
              isUploading: false,
              progress: 100,
              error: null,
              url: url,
            },
          };
          return newFiles;
        });
      } catch (err) {
        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[i] = {
            ...newFiles[i],
            uploadStatus: {
              isUploading: false,
              progress: 0,
              error: err instanceof Error ? err.message : "Upload failed",
              url: null,
            },
          };
          return newFiles;
        });
      }
    }

    setIsUploading(false);

    if (uploadedUrls.length > 0) {
      onUploadComplete(uploadedUrls);
    }
  };

  const isVideo = (file: File) => SUPPORTED_VIDEO_TYPES.includes(file.type);
  const isImage = (file: File) => SUPPORTED_IMAGE_TYPES.includes(file.type);

  const acceptedTypes = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES].join(",");

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer
          ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
          ${files.length >= maxFiles ? "opacity-50 pointer-events-none" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">
              Drop your video or images here
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Supports: MP4, WebM, MOV (up to 100MB) | JPEG, PNG, GIF, WebP (up to 10MB)
          </p>
        </div>
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">
            Selected files ({files.length}/{maxFiles})
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map((fileData, index) => (
              <div
                key={index}
                className="relative flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                {/* Preview Thumbnail */}
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {isVideo(fileData.file) ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <FileVideo className="w-8 h-8 text-muted-foreground" />
                    </div>
                  ) : isImage(fileData.file) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fileData.preview}
                      alt={fileData.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {fileData.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(fileData.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>

                  {/* Upload Progress */}
                  {fileData.uploadStatus.isUploading && (
                    <Progress
                      value={fileData.uploadStatus.progress}
                      className="mt-2 h-1"
                    />
                  )}

                  {/* Error Message */}
                  {fileData.uploadStatus.error && (
                    <p className="text-xs text-destructive mt-1">
                      {fileData.uploadStatus.error}
                    </p>
                  )}

                  {/* Success Indicator */}
                  {fileData.uploadStatus.url && (
                    <p className="text-xs text-green-600 mt-1">
                      Uploaded successfully
                    </p>
                  )}
                </div>

                {/* Remove Button */}
                {!fileData.uploadStatus.isUploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <Button
          onClick={uploadFiles}
          disabled={isUploading || files.every((f) => f.uploadStatus.url)}
          className="w-full"
          size="lg"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : files.every((f) => f.uploadStatus.url) ? (
            "All files uploaded"
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload {files.length} file{files.length > 1 ? "s" : ""}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
