"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/utils";
import { Dumbbell, Trophy, UserPlus } from "lucide-react";

interface FeedItem {
  id: string;
  type: "workout_completed" | "record_broken" | "team_joined";
  message: string;
  userName: string;
  userAvatar: string | null;
  teamName?: string;
  createdAt: string;
}

export function ActivityFeed({ teamId }: { teamId?: string }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = teamId ? `/api/feed?teamId=${teamId}` : "/api/feed";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setItems(data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [teamId]);

  const iconMap = {
    workout_completed: <Dumbbell className="h-4 w-4 text-brand-500" />,
    record_broken: <Trophy className="h-4 w-4 text-amber-500" />,
    team_joined: <UserPlus className="h-4 w-4 text-blue-500" />,
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="h-8 w-8 rounded-full bg-surface-200" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-surface-200" />
              <div className="h-2 w-1/2 rounded bg-surface-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-surface-400">暂无动态</p>
        <p className="text-xs text-surface-300 mt-1">
          开始训练后这里会展示你和队友的活动
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-surface-100">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-100">
            {iconMap[item.type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-surface-700">{item.message}</p>
            <p className="text-xs text-surface-400 mt-0.5">
              {timeAgo(item.createdAt)}
              {item.teamName && (
                <span className="ml-2">🏠 {item.teamName}</span>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
