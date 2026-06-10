"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── 防抖 Hook ───
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

// ─── 防抖函数（非 Hook 版本）───
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay = 400
): (...args: Parameters<T>) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
    },
    [delay]
  );
}

// ─── 简单内存缓存（用于不常变化的 API 数据）───
const cache = new Map<string, { data: unknown; timestamp: number }>();
const DEFAULT_TTL = 60_000; // 60 秒

export function useCachedFetch<T>(
  url: string,
  ttl = DEFAULT_TTL,
  enabled = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (skipCache = false) => {
      if (!enabled) return;

      // 检查缓存
      if (!skipCache) {
        const cached = cache.get(url);
        if (cached && Date.now() - cached.timestamp < ttl) {
          setData(cached.data as T);
          return;
        }
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const res = await fetch(url, { signal: controller.signal });
        const json = await res.json();
        const result = json.data !== undefined ? json.data : json;
        cache.set(url, { data: result, timestamp: Date.now() });
        setData(result);
        setError(null);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e.message || "请求失败");
        }
      } finally {
        setLoading(false);
      }
    },
    [url, ttl, enabled]
  );

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  return { data, loading, error, refetch: () => fetchData(true) };
}

// ─── 清除缓存 ───
export function clearCache(url?: string) {
  if (url) {
    cache.delete(url);
  } else {
    cache.clear();
  }
}
