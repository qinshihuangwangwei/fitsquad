"use client";

import { getAchievementInfo } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BadgeGridProps {
  achievements: { achievement: string; unlockedAt: Date }[];
  allAchievements?: boolean; // 是否显示所有（含未解锁）
}

export function BadgeGrid({
  achievements,
  allAchievements = false,
}: BadgeGridProps) {
  const unlocked = new Set(achievements.map((a) => a.achievement));

  const allTypes = allAchievements
    ? [
        "STREAK_3",
        "STREAK_7",
        "STREAK_30",
        "VOLUME_1000",
        "VOLUME_5000",
        "VOLUME_10000",
        "FIRST_RECORD",
        "TEAM_PLAYER",
        "PLAN_CREATOR",
      ]
    : achievements.map((a) => a.achievement);

  const uniqueTypes = [...new Set(allTypes)];

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {uniqueTypes.map((type) => {
        const info = getAchievementInfo(type);
        const isUnlocked = unlocked.has(type);

        return (
          <div
            key={type}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all",
              isUnlocked
                ? "border-amber-200 bg-amber-50"
                : "border-surface-200 bg-surface-50 opacity-50 grayscale"
            )}
          >
            <span className="text-2xl">{info.icon}</span>
            <span className="text-xs font-medium text-surface-700">
              {info.title}
            </span>
            <span className="text-[10px] text-surface-400 leading-tight">
              {info.description}
            </span>
            {!isUnlocked && (
              <span className="text-[10px] text-surface-300">🔒 未解锁</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
