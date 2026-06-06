"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function DeletePlanButton({ planId }: { planId: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    await fetch(`/api/plans/${planId}`, { method: "DELETE" });
    router.push("/plans");
    router.refresh();
  };

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        删除
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-red-600">确认删除？</span>
      <button
        onClick={handleDelete}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
      >
        确认
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="rounded-lg border border-surface-300 px-3 py-1.5 text-xs font-medium text-surface-600"
      >
        取消
      </button>
    </div>
  );
}
