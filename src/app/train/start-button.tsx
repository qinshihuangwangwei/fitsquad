"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Play } from "lucide-react";

export function StartTrainingButton({ planId }: { planId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teamId, setTeamId] = useState("");

  const handleStart = async () => {
    setLoading(true);
    const res = await fetch("/api/sessions/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId,
        teamId: teamId || undefined,
      }),
    });

    const data = await res.json();
    if (res.ok && data.data) {
      router.push(`/train/${data.data.id}`);
    }
    setLoading(false);
  };

  return (
    <div className="mt-4 space-y-3">
      <button
        onClick={handleStart}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        <Play className="h-4 w-4" />
        {loading ? "创建训练中..." : "开始训练"}
      </button>
    </div>
  );
}
