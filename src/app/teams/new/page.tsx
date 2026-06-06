"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTeamPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("请输入团队名称");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "创建失败");
    } else {
      router.push(`/teams/${data.data.id}`);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link
        href="/teams"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700"
      >
        <ArrowLeft className="h-4 w-4" /> 返回
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-surface-900">创建新团队</h1>
      <p className="mt-1 text-sm text-surface-500">
        组建你的健身小队，一起训练打卡
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-surface-700">
            团队名称 *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：铁血健身组"
            maxLength={50}
            className="mt-1.5 w-full rounded-lg border border-surface-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700">
            团队简介
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述一下团队的风格和目标..."
            maxLength={500}
            rows={3}
            className="mt-1.5 w-full rounded-lg border border-surface-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none resize-none"
          />
          <p className="mt-1 text-xs text-surface-400">
            {description.length}/500
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "创建中..." : "创建团队"}
        </button>
      </form>
    </div>
  );
}
