"use client";

import { formatWeight, formatDate } from "@/lib/utils";
import { Trophy, Medal } from "lucide-react";

interface RecordCardProps {
  exerciseName: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  achievedAt: Date;
  rank?: number;
}

export function RecordCard({
  exerciseName,
  muscleGroup,
  weight,
  reps,
  achievedAt,
  rank,
}: RecordCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-surface-200 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white">
        {rank !== undefined && rank <= 3 ? (
          <Trophy className="h-5 w-5" />
        ) : (
          <Medal className="h-5 w-5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-surface-900">{exerciseName}</p>
        <p className="text-xs text-surface-400">{muscleGroup}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-brand-600">
          {formatWeight(weight)}
        </p>
        <p className="text-xs text-surface-400">
          {reps} 次 · {formatDate(achievedAt)}
        </p>
      </div>
    </div>
  );
}
