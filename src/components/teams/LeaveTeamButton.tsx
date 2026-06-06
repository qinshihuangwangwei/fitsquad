"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, AlertTriangle, X } from "lucide-react";

export function LeaveTeamButton({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleLeave = async () => {
    setLeaving(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/leave`, { method: "POST" });
      if (res.ok) {
        router.push("/teams");
        router.refresh();
      }
    } catch {
      // 静默处理
    }
    setLeaving(false);
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        退出团队
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-slide-up">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold text-surface-900">退出团队</h3>
        </div>
        <p className="mt-3 text-sm text-surface-600">
          确定要退出「{teamName}」吗？退出后将无法查看团队计划和排行榜。
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setShowConfirm(false)}
            disabled={leaving}
            className="flex-1 rounded-lg border border-surface-300 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleLeave}
            disabled={leaving}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {leaving ? "退出中..." : "确认退出"}
          </button>
        </div>
      </div>
    </div>
  );
}
