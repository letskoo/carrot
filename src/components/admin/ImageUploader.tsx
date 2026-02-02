"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  title: string;
  maxFiles: number;
  maxSizePerFile: number; // MB
  onUpload: (urls: string[]) => Promise<void>;
}

export default function ImageUploader({
  title,
  maxFiles,
  maxSizePerFile,
  onUpload,
}: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setError("");
    setMessage("");

    // 파일 수 확인
    if (selectedFiles.length + uploadedUrls.length > maxFiles) {
      setError(
        `최대 ${maxFiles}개 파일만 업로드 가능합니다 (현재 ${uploadedUrls.length}개)`
      );
      return;
    }

    // 파일 크기 확인
    for (const file of selectedFiles) {
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > maxSizePerFile) {
        setError(
          `각 파일은 ${maxSizePerFile}MB 이하여야 합니다 (선택된 파일: ${sizeInMB.toFixed(2)}MB)`
        );
        return;
      }
    }

    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("업로드할 파일을 선택해주세요");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.ok && data.urls) {
        const allUrls = [...uploadedUrls, ...data.urls];
        setUploadedUrls(allUrls);
        setFiles([]);
        await onUpload(allUrls);
        setMessage(`✅ ${data.urls.length}개 파일이 업로드되었습니다`);
      } else {
        setError(data.message || "업로드 실패");
      }
    } catch (err) {
      setError("업로드 중 오류가 발생했습니다");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const removeUrl = (index: number) => {
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>

      {/* 파일 선택 */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          id={`file-input-${title}`}
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <label
          htmlFor={`file-input-${title}`}
          className="cursor-pointer flex flex-col items-center"
        >
          <svg
            className="w-8 h-8 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="text-sm font-medium text-gray-600">
            클릭하여 파일 선택
          </span>
          <span className="text-xs text-gray-500 mt-1">
            최대 {maxSizePerFile}MB
          </span>
        </label>
      </div>

      {/* 선택된 파일 목록 */}
      {files.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">
            선택된 파일: {files.length}개
          </p>
          <ul className="text-sm text-blue-800 space-y-1">
            {files.map((file, i) => (
              <li key={i}>• {file.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 업로드 버튼 */}
      {files.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 font-semibold"
        >
          {uploading ? "업로드 중..." : "업로드"}
        </button>
      )}

      {/* 업로드된 이미지 목록 */}
      {uploadedUrls.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            업로드된 이미지: {uploadedUrls.length}/{maxFiles}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="relative w-full aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`uploaded-${index}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeUrl(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {message}
        </div>
      )}
    </div>
  );
}
