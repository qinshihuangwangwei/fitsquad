"use client";

import Link from "next/link";
import { PlanWithDays } from "@/types";
import { Dumbbell, Clock, Calendar } from "lucide-react";

interface PlanCardProps {
  plan: PlanWithDays;
}

export function PlanCard({ plan }: PlanCardProps) {
  const totalExercises = plan.days.reduce(
    (sum, day) => sum + day.exercises.length,
    0
  );

  return (
    <Link
      href={`/plans/${plan.id}`}
      className="block rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-brand-300"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
          <Dumbbell className="h-5 w-5 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-surface-900">{plan.name}</h3>
          {plan.description && (
            <p className="mt-0.5 text-xs text-surface-500 line-clamp-1">
              {plan.description}
            </p>
          )}
        </div>
        {plan.isTemplate && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            模板
          </span>
        )}
        {plan.team && (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
            {plan.team.name}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-surface-400">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {plan.days.length} 天
        </span>
        <span className="flex items-center gap-1">
          <Dumbbell className="h-3.5 w-3.5" />
          {totalExercises} 个动作
        </span>
      </div>
    </Link>
  );
}
