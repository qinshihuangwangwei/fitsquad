// ─── 标准化 API 响应 ───
export interface ApiResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  status: number;
}

// ─── 统一 API 请求封装 ───
export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    // 401 → 跳转登录
    if (res.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
      return { ok: false, error: "请重新登录", status: 401 };
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      return { ok: false, error: `服务器错误 (${res.status})`, status: res.status };
    }

    if (!res.ok) {
      const err = (data as { error?: string })?.error || `请求失败 (${res.status})`;
      return { ok: false, error: err, status: res.status };
    }

    return {
      ok: true,
      data: ((data as { data?: T })?.data ?? data) as T,
      status: res.status,
    };
  } catch (e: any) {
    if (e.name === "AbortError") {
      return { ok: false, error: "请求已取消", status: 0 };
    }
    return { ok: false, error: "网络错误，请检查连接", status: 0 };
  }
}

// ─── GET 快捷方法 ───
export function apiGet<T = unknown>(url: string, signal?: AbortSignal) {
  return apiFetch<T>(url, { method: "GET", signal });
}

// ─── POST 快捷方法 ───
export function apiPost<T = unknown>(url: string, body?: unknown, signal?: AbortSignal) {
  return apiFetch<T>(url, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
}

// ─── PUT 快捷方法 ───
export function apiPut<T = unknown>(url: string, body?: unknown) {
  return apiFetch<T>(url, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ─── DELETE 快捷方法 ───
export function apiDelete<T = unknown>(url: string) {
  return apiFetch<T>(url, { method: "DELETE" });
}
