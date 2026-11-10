"use client";
import React from "react";
import { ChunkUploadProgress as ChunkUploadProgressType } from "@/utils/api/instructor/createCourseApis/create-course/chunkedUpload";
import { useTranslation } from "@/hooks/useTranslation";

interface ChunkUploadProgressProps {
  progress: ChunkUploadProgressType;
}

/**
 * Visual progress indicator for chunked video uploads.
 * Shows a progress bar, status text, and chunk/size details.
 */
export default function ChunkUploadProgressBar({ progress }: ChunkUploadProgressProps) {
  const { t } = useTranslation();

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusLabel = (): string => {
    switch (progress.status) {
      case "preparing":
        return t("preparing_upload") || "Preparing upload...";
      case "uploading":
        return `${t("uploading") || "Uploading"} ${t("chunk") || "chunk"} ${progress.currentChunkIndex}/${progress.totalChunks}`;
      case "completed":
        return t("upload_completed") || "Upload completed!";
      case "error":
        return t("upload_failed") || "Upload failed";
      default:
        return "";
    }
  };

  const getStatusColor = (): string => {
    switch (progress.status) {
      case "completed":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "primaryBg";
    }
  };

  const getStatusTextColor = (): string => {
    switch (progress.status) {
      case "completed":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "primaryColor";
    }
  };

  return (
    <div className="w-full space-y-2 p-3 border borderColor rounded-lg bg-gray-50">
      {/* Status text */}
      <div className="flex justify-between items-center">
        <p className={`text-sm font-medium ${getStatusTextColor()}`}>
          {getStatusLabel()}
        </p>
        <span className="text-sm font-semibold text-gray-700">
          {progress.percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${getStatusColor()}`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Details row */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          {formatBytes(progress.bytesUploaded)} / {formatBytes(progress.totalBytes)}
        </span>
        {progress.status === "uploading" && (
          <span>
            {progress.uploadedChunks}/{progress.totalChunks} {t("chunks") || "chunks"}
          </span>
        )}
      </div>

      {/* Error retry hint */}
      {progress.status === "error" && (
        <p className="text-xs text-red-500 mt-1">
          {t("chunk_upload_error_hint") || "Upload failed. Please try again."}
        </p>
      )}
    </div>
  );
}
