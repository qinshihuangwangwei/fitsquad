"use client";

import { useEffect, useRef, useCallback, useState } from "react";

// ─── 通用轮询钩子 ───
interface UsePollingOptions {
  url: string;
  intervalMs: number;
  enabled?: boolean;
}

export function usePolling<T>({ url, intervalMs, enabled = true }: UsePollingOptions) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.data !== undefined) {
        setData(json.data);
      } else {
        setData(json);
      }
      setError(null);
    } catch (e) {
      setError("轮询失败");
    }
  }, [url]);

  useEffect(() => {
    if (!enabled) return;
    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => clearInterval(id);
  }, [fetchData, intervalMs, enabled]);

  return { data, error, refetch: fetchData };
}

// ─── 订阅团队训练动态（轮询版） ───
export function useTeamFeed(
  teamId: string | undefined,
  onNewSet: (data: unknown) => void
) {
  const lastSeenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!teamId) return;

    const poll = async () => {
      try {
        const url = lastSeenRef.current
          ? `/api/feed?teamId=${teamId}&since=${lastSeenRef.current}`
          : `/api/feed?teamId=${teamId}&limit=5`;
        const res = await fetch(url);
        const json = await res.json();
        const items = json.data || [];

        for (const item of items) {
          if (item.type === "workout_completed" && item.id !== lastSeenRef.current) {
            onNewSet(item);
            lastSeenRef.current = item.id;
          }
        }
      } catch { /* 静默处理 */ }
    };

    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [teamId, onNewSet]);
}

// ─── 订阅用户通知（轮询版） ───
export function useNotificationStream(
  userId: string | undefined,
  onNotification: (data: unknown) => void
) {
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    if (!userId) return;

    const poll = async () => {
      try {
        const res = await fetch("/api/notifications?unread=true");
        const json = await res.json();
        const notifications = json.data || [];

        for (const n of notifications) {
          if (!seenIds.current.has(n.id)) {
            seenIds.current.add(n.id);
            onNotification(n);
          }
        }
      } catch { /* 静默处理 */ }
    };

    poll();
    const id = setInterval(poll, 10000);
    return () => clearInterval(id);
  }, [userId, onNotification]);
}
