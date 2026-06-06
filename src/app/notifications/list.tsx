"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCheck,
  Trash2,
  Users,
  Trophy,
  Dumbbell,
  Award,
  Info,
  Bell,
  Loader2,
  Inbox,
  X,
  Check,
} from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedId: string | null;
  createdAt: string;
}

const TABS = [
  { key: "", label: "全部" },
  { key: "true", label: "未读" },
  { key: "TEAM_INVITE", label: "小队邀请" },
  { key: "SYSTEM", label: "系统通知" },
] as const;

const iconMap: Record<string, React.ReactNode> = {
  TEAM_INVITE: <Users className="h-4 w-4 text-blue-500" />,
  TEAM_JOINED: <Users className="h-4 w-4 text-green-500" />,
  RECORD_BROKEN: <Trophy className="h-4 w-4 text-amber-500" />,
  WORKOUT_COMPLETED: <Dumbbell className="h-4 w-4 text-brand-500" />,
  ACHIEVEMENT: <Award className="h-4 w-4 text-purple-500" />,
  SYSTEM: <Info className="h-4 w-4 text-surface-400" />,
};

export function NotificationList({
  initialData,
  initialUnreadCount,
  initialTotalCount,
  filterType,
}: {
  initialData: NotificationItem[];
  initialUnreadCount: number;
  initialTotalCount: number;
  filterType: string;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialData);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [totalCount] = useState(initialTotalCount);
  const [activeTab, setActiveTab] = useState(filterType || "");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotalCount > 20);
  const [markingAll, setMarkingAll] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // 切换 tab 时重新加载
  useEffect(() => {
    if (activeTab === filterType && page === 1) return;
    loadNotifications(1, activeTab, true);
  }, [activeTab]);

  const loadNotifications = async (p: number, type: string, reset: boolean) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(p));
    params.set("limit", "20");
    if (type === "true") {
      params.set("unread", "true");
    } else if (type && type !== "true") {
      params.set("type", type);
    }
    const res = await fetch(`/api/notifications?${params}`);
    const data = await res.json();
    if (reset) {
      setNotifications(data.data || []);
    } else {
      setNotifications((prev) => [...prev, ...(data.data || [])]);
    }
    setHasMore(data.hasMore);
    setPage(p);
    setLoading(false);
  };

  // 无限滚动
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadNotifications(page + 1, activeTab, false);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, activeTab]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (!notifications.find((n) => n.id === id)?.read) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    await fetch("/api/notifications", { method: "PUT" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    setMarkingAll(false);
  };

  const handleDelete = async (id: string) => {
    const wasUnread = !notifications.find((n) => n.id === id)?.read;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
  };

  const handleAccept = async (teamId: string, notifyId: string) => {
    await fetch("/api/teams/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, action: "accept" }),
    });
    markAsRead(notifyId);
    router.refresh();
  };

  const handleReject = async (teamId: string, notifyId: string) => {
    await fetch("/api/teams/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, action: "reject" }),
    });
    markAsRead(notifyId);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-surface-400 hover:text-surface-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-surface-900">通知中心</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-brand-600 font-medium">
                {unreadCount} 条未读
              </p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 rounded-lg bg-surface-100 px-3 py-2 text-xs font-medium text-surface-600 hover:bg-surface-200 disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {markingAll ? "..." : "全部已读"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 overflow-x-auto rounded-lg bg-surface-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white text-surface-900 shadow-sm"
                : "text-surface-500 hover:text-surface-700"
            )}
          >
            {tab.label}
            {tab.key === "true" && unreadCount > 0 && (
              <span className="ml-1 text-brand-600">({unreadCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* 通知列表 */}
      <div className="mt-4">
        {notifications.length === 0 ? (
          <div className="mt-16 text-center">
            <Inbox className="mx-auto h-14 w-14 text-surface-200" />
            <p className="mt-4 text-base font-medium text-surface-500">
              暂无通知
            </p>
            <p className="mt-1 text-xs text-surface-400">
              {activeTab === "TEAM_INVITE"
                ? "还没有收到团队邀请"
                : activeTab === "true"
                ? "所有通知已读 🎉"
                : "当有团队邀请、纪录突破等消息时会显示在这里"}
            </p>
            {activeTab === "TEAM_INVITE" && (
              <Link
                href="/teams"
                className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white"
              >
                去看看我的团队
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkRead={markAsRead}
                onDelete={handleDelete}
                onAccept={n.type === "TEAM_INVITE" && n.relatedId ? handleAccept : undefined}
                onReject={n.type === "TEAM_INVITE" && n.relatedId ? handleReject : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* 加载更多触发器 */}
      <div ref={loaderRef} className="mt-4 flex justify-center py-4">
        {loading && <Loader2 className="h-5 w-5 animate-spin text-surface-300" />}
        {!hasMore && notifications.length > 0 && (
          <p className="text-xs text-surface-300">— 没有更多了 —</p>
        )}
      </div>
    </div>
  );
}

// ─── 单条通知卡片 ───
function NotificationCard({
  notification: n,
  onMarkRead,
  onDelete,
  onAccept,
  onReject,
}: {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAccept?: (teamId: string, notifyId: string) => void;
  onReject?: (teamId: string, notifyId: string) => void;
}) {
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [handled, setHandled] = useState(false);

  const handleAccept = async () => {
    if (!n.relatedId || !onAccept) return;
    setAccepting(true);
    await onAccept(n.relatedId, n.id);
    setAccepting(false);
    setHandled(true);
  };

  const handleReject = async () => {
    if (!n.relatedId || !onReject) return;
    setRejecting(true);
    await onReject(n.relatedId, n.id);
    setRejecting(false);
    setHandled(true);
  };

  return (
    <div
      onClick={() => !n.read && onMarkRead(n.id)}
      className={cn(
        "flex items-start gap-3 rounded-xl p-3 transition-colors group",
        !n.read
          ? "bg-brand-50/60 border border-brand-100 cursor-pointer"
          : "bg-white border border-surface-100"
      )}
    >
      {/* 未读圆点 */}
      <div className="flex-shrink-0 mt-1.5">
        {!n.read ? (
          <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />
        ) : (
          <div className="h-2.5 w-2.5" />
        )}
      </div>

      {/* 图标 */}
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-surface-100">
        {iconMap[n.type] || <Bell className="h-4 w-4 text-surface-400" />}
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm",
            !n.read ? "font-semibold text-surface-900" : "text-surface-500"
          )}
        >
          {n.title}
        </p>
        <p className="text-xs text-surface-500 mt-0.5">{n.message}</p>
        <p className="text-[11px] text-surface-400 mt-1.5">
          {timeAgo(n.createdAt)}
        </p>

        {/* 小队邀请的操作按钮 */}
        {n.type === "TEAM_INVITE" && n.relatedId && !handled && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAccept();
              }}
              disabled={accepting || rejecting}
              className="flex items-center gap-1 rounded-md bg-brand-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              <Check className="h-3 w-3" />
              {accepting ? "..." : "接受"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReject();
              }}
              disabled={accepting || rejecting}
              className="flex items-center gap-1 rounded-md border border-surface-300 px-2.5 py-1 text-[11px] font-medium text-surface-600 hover:bg-surface-50 disabled:opacity-50"
            >
              <X className="h-3 w-3" />
              {rejecting ? "..." : "拒绝"}
            </button>
          </div>
        )}

        {/* 已处理状态 */}
        {n.type === "TEAM_INVITE" && handled && (
          <p className="mt-1 text-[11px] text-surface-400">已处理</p>
        )}
      </div>

      {/* 删除按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(n.id);
        }}
        className="flex-shrink-0 p-1 text-surface-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
