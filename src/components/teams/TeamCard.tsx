"use client";

import Link from "next/link";
import { TeamWithMembers } from "@/types";
import { formatDate } from "@/lib/utils";
import { Users, Crown } from "lucide-react";

interface TeamCardProps {
  team: TeamWithMembers;
}

export function TeamCard({ team }: TeamCardProps) {
  const isCaptain = team.captainId === team.captain.id;

  return (
    <Link
      href={`/teams/${team.id}`}
      className="block rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-brand-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
            {team.name[0]}
          </div>
          <div>
            <h3 className="font-semibold text-surface-900">{team.name}</h3>
            <p className="text-xs text-surface-500">
              创建于 {formatDate(team.createdAt)}
            </p>
          </div>
        </div>
        {isCaptain && (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            <Crown className="h-3 w-3" /> 队长
          </span>
        )}
      </div>

      {team.description && (
        <p className="mt-3 text-sm text-surface-600 line-clamp-2">
          {team.description}
        </p>
      )}

      <div className="mt-4 flex items-center gap-4 text-xs text-surface-500">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {team._count.members} 名成员
        </span>
      </div>
    </Link>
  );
}
