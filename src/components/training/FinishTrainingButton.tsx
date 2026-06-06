"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, X } from "lucide-react";

interface FinishTrainingButtonProps {
  sessionId: string;
  allDone: boolean;
  disabled: boolean;
}

export function FinishTrainingButton({
  sessionId,
  allDone,
  disabled,
}: FinishTrainingButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finished, setFinished] = useState(false);
  const [summary, setSummary] = useState<{
    totalVolume: number;
    doneSets: number;
    totalSets: number;
  } | null>(null);

  const handleFinish = async () => {
    setFinishing(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/finish`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.data);
        setFinished(true);
      }
    } catch {
      // 静默处理
    }
    setFinishing(false);
    setShowConfirm(false);
  };

  if (finished && summary) {
    return (
      <div className="mt-6 rounded-xl border-2 border-brand-200 bg-brand-50 p-6 text-center animate-slide-up">
        <Flag className="mx-auto h-10 w-10 text-brand-500" />
        <h2 className="mt-2 text-lg font-bold text-surface-900">
          🎉 训练完成！
        </h2>
        <p className="mt-1 text-sm text-surface-500">
          共完成 {summary.doneSets}/{summary.totalSets} 组
        </p>
        <p className="text-sm font-semibold text-brand-600">
          总容量: {(summary.totalVolume / 1000).toFixed(1)}K KG
        </p>
        <div className="mt-4 flex gap-3 justify-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            返回主页
          </button>
          <button
            onClick={() => router.push("/train")}
            className="rounded-lg border border-surface-300 px-5 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50"
          >
            开始新训练
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-surface-300 py-3 text-sm font-medium text-surface-600 hover:border-red-300 hover:text-red-600 disabled:opacity-40 transition-colors"
        >
          <Flag className="h-4 w-4" />
          {allDone ? "全部完成，结束训练" : "结束训练"}
        </button>
      ) : (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 animate-slide-up">
          <p className="text-sm font-medium text-red-800">
            确定要结束本次训练吗？
          </p>
          <p className="text-xs text-red-600 mt-1">
            结束后将无法继续记录组数，但已完成的数据会保留。
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleFinish}
              disabled={finishing}
              className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {finishing ? "处理中..." : "确认结束"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={finishing}
              className="flex items-center gap-1 rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-600 hover:bg-white disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
