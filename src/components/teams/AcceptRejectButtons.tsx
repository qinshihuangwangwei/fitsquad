"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AcceptRejectButtons({
  teamId,
}: {
  teamId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: "accept" | "reject") => {
    setLoading(action);
    await fetch("/api/teams/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, action }),
    });
    router.refresh();
    setLoading(null);
  };

  return (
    <>
      <button
        onClick={() => handleAction("accept")}
        disabled={loading !== null}
        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading === "accept" ? "..." : "接受"}
      </button>
      <button
        onClick={() => handleAction("reject")}
        disabled={loading !== null}
        className="rounded-lg border border-surface-300 px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-50 disabled:opacity-50"
      >
        {loading === "reject" ? "..." : "拒绝"}
      </button>
    </>
  );
}
