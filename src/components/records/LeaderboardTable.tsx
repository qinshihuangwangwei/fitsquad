"use client";

import { useState } from "react";
import { formatWeight, formatDate } from "@/lib/utils";
import { Trophy, Medal, ArrowUpDown } from "lucide-react";

interface LeaderboardRow {
  exerciseName: string;
  exerciseId: string;
  muscleGroup: string;
  bestUserName: string;
  bestWeight: number;
  bestReps: number;
  achievedAt: Date;
}

interface LeaderboardTableProps {
  data: LeaderboardRow[];
}

export function LeaderboardTable({ data }: LeaderboardTableProps) {
  const [sortBy, setSortBy] = useState<"weight" | "date">("weight");

  const sorted = [...data].sort((a, b) => {
    if (sortBy === "weight") return b.bestWeight - a.bestWeight;
    return new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime();
  });

  return (
    <div className="overflow-hidden rounded-xl border border-surface-200">
      <div className="flex items-center justify-between bg-surface-50 px-4 py-3">
        <span className="text-sm font-medium text-surface-700">
          动作排名
        </span>
        <button
          onClick={() =>
            setSortBy(sortBy === "weight" ? "date" : "weight")
          }
          className="flex items-center gap-1 text-xs text-surface-500 hover:text-surface-700"
        >
          <ArrowUpDown className="h-3 w-3" />
          {sortBy === "weight" ? "按重量" : "按日期"}
        </button>
      </div>
      <div className="divide-y divide-surface-100">
        {sorted.map((row, index) => (
          <div
            key={row.exerciseId}
            className="flex items-center gap-3 px-4 py-3"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
              {index === 0 ? (
                <Trophy className="h-4 w-4 text-amber-500" />
              ) : index === 1 ? (
                <Medal className="h-4 w-4 text-slate-400" />
              ) : index === 2 ? (
                <Medal className="h-4 w-4 text-amber-700" />
              ) : (
                <span className="text-surface-400">{index + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">
                {row.exerciseName}
              </p>
              <p className="text-xs text-surface-400">
                {row.bestUserName} · {formatDate(row.achievedAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-brand-600">
                {formatWeight(row.bestWeight)}
              </p>
              <p className="text-xs text-surface-400">{row.bestReps} 次</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
