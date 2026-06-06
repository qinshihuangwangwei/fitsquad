"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/BottomSheet";

interface TeamInviteModalProps {
  teamId: string;
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamInviteModal({
  teamId,
  teamName,
  isOpen,
  onClose,
}: TeamInviteModalProps) {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleInvite = async () => {
    if (!userId.trim()) {
      setError("请输入用户 ID");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/teams/${teamId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "邀请失败");
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setUserId("");
        }, 1500);
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  if (!isOpen) return null;

  const content = (
    <>
      <div>
        <label className="block text-sm font-medium text-surface-700">
          用户 ID
        </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="输入要邀请的用户 ID"
          className={cn(
            "mt-1.5 w-full rounded-lg border border-surface-300 px-3 py-3 text-sm",
            "focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
          )}
        />
        <p className="mt-1 text-xs text-surface-400">
          被邀请用户可以在个人中心的 ID 处查看
        </p>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>
      )}
      {success && (
        <p className="mt-3 text-sm text-green-600 bg-green-50 rounded-lg p-2">邀请已发送！</p>
      )}

      <div className="mt-5 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-surface-300 py-3 text-sm font-medium text-surface-700 hover:bg-surface-50"
        >
          取消
        </button>
        <button
          onClick={handleInvite}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <UserPlus className="h-4 w-4" />
          {loading ? "发送中..." : "发送邀请"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 桌面端：居中弹窗 */}
      <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900">
              邀请成员加入「{teamName}」
            </h2>
            <button onClick={onClose} className="rounded-lg p-1 text-surface-400 hover:bg-surface-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          {content}
        </div>
      </div>

      {/* 移动端：底部抽屉 */}
      <BottomSheet
        open={true}
        onClose={onClose}
        title={`邀请成员加入「${teamName}」`}
      >
        {content}
      </BottomSheet>
    </>
  );
}
