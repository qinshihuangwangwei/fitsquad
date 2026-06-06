"use client";

import { useState, useCallback } from "react";

// ─── 乐观更新泛型钩子 ───
export function useOptimistic<T>(
  initial: T
): [
  T,
  (update: (current: T) => T, rollback: (current: T) => T, serverAction: () => Promise<void>) => Promise<void>,
  boolean,
] {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(
    async (
      optimisticUpdate: (current: T) => T,
      rollback: (current: T) => T,
      serverAction: () => Promise<void>
    ) => {
      const previous = data;
      setData(optimisticUpdate);
      setLoading(true);

      try {
        await serverAction();
      } catch {
        setData(rollback(previous));
      } finally {
        setLoading(false);
      }
    },
    [data]
  );

  return [data, mutate, loading];
}
