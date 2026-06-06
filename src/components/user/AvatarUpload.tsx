"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName: string;
}

export function AvatarUpload({ currentAvatar, userName }: AvatarUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const displaySrc = preview || currentAvatar || null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 本地预览
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // 上传
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch("/api/user/avatar", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "上传失败");
      setPreview(null);
    } else {
      router.refresh();
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700 overflow-hidden hover:ring-4 hover:ring-brand-200 transition-all disabled:opacity-50"
        >
          {displaySrc ? (
            <img
              src={displaySrc}
              alt={userName}
              className="h-full w-full object-cover"
            />
          ) : (
            userName[0]
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity rounded-full">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </button>

        {uploading && (
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
            <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <p className="text-xs text-surface-400">
        点击更换头像 · 支持 PNG/JPEG/WebP · ≤2MB
      </p>
    </div>
  );
}
