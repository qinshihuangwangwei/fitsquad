"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  ChevronRight,
  Dumbbell,
  Trophy,
  Users,
  Bell,
  Shield,
  Moon,
  Info,
  LogOut,
  Flame,
  Settings,
  Calendar,
} from "lucide-react";
import { cn, formatWeight, formatDate } from "@/lib/utils";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  bodyWeight: number | null;
  createdAt: string;
}

interface Stats {
  totalSessions: number;
  totalSets: number;
  totalVolume: number;
  streakDays: number;
  teamCount: number;
}

export function ProfileClient({
  user,
  initialUnreadCount,
}: {
  user: ProfileUser;
  initialUnreadCount: number;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [uploading, setUploading] = useState(false);

  // 加载统计数据
  useEffect(() => {
    fetch("/api/user/profile/stats")
      .then((r) => r.json())
      .then((data) => setStats(data.data))
      .catch(() => {});
  }, []);

  // 定期更新未读通知数
  useEffect(() => {
    const id = setInterval(() => {
      fetch("/api/notifications?unread=true&limit=1")
        .then((r) => r.json())
        .then((data) => setUnreadCount(data.unreadCount || 0))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(id);
  }, []);

  // 更换头像
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    await fetch("/api/user/avatar", { method: "POST", body: formData });
    setUploading(false);
    router.refresh();
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const avatarSrc = session?.user?.image || user.avatar;

  return (
    <div className="mx-auto max-w-lg pb-20">
      {/* ─── 头部：头像 + 信息 ─── */}
      <div className="flex flex-col items-center px-6 pt-8 pb-6 bg-white border-b border-surface-100">
        {/* 头像 */}
        <label className="relative cursor-pointer group">
          <div className="relative">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user.name}
                className="h-20 w-20 rounded-full object-cover border-2 border-surface-200"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-600 border-2 border-surface-200">
                {user.name[0]}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-white font-medium">更换</span>
          </div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </label>

        {/* 昵称 */}
        <h1 className="mt-3 text-lg font-bold text-surface-900">
          {user.name}
        </h1>

        {/* 个人签名 */}
        <p className="mt-1 text-xs text-surface-400">
          {user.bio || "这个人很懒，什么都没写…"}
        </p>

        {/* ID + 加入时间 */}
        <p className="mt-2 text-[11px] text-surface-300">
          ID: {user.id.slice(0, 10)}... · 加入于 {formatDate(user.createdAt)}
          {user.bodyWeight && (
            <span className="ml-2">体重: {user.bodyWeight} KG</span>
          )}
        </p>
      </div>

      {/* ─── 第一组：健身数据 ─── */}
      <div className="mt-3 mx-4 bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-surface-100">
          {[
            {
              icon: <Dumbbell className="h-5 w-5 text-brand-500" />,
              label: "训练次数",
              value: stats?.totalSessions ?? "-",
              href: "/dashboard",
            },
            {
              icon: <Flame className="h-5 w-5 text-orange-500" />,
              label: "连续打卡",
              value: stats ? `${stats.streakDays}天` : "-",
              href: "/records",
            },
            {
              icon: <Users className="h-5 w-5 text-blue-500" />,
              label: "我的小队",
              value: stats?.teamCount ?? "-",
              href: "/teams",
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center py-4 hover:bg-surface-50 transition-colors"
            >
              {item.icon}
              <span className="mt-1.5 text-lg font-bold text-surface-900">
                {item.value}
              </span>
              <span className="text-[11px] text-surface-400">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* 第二行 */}
        <div className="grid grid-cols-2 divide-x divide-surface-100 border-t border-surface-100">
          {[
            {
              label: "总完成组数",
              value: stats?.totalSets ?? "-",
            },
            {
              label: "总训练容量",
              value: stats
                ? `${(stats.totalVolume / 1000).toFixed(1)}K KG`
                : "-",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center py-3"
            >
              <span className="text-sm font-semibold text-surface-700">
                {item.value}
              </span>
              <span className="text-[11px] text-surface-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 第二组：功能入口 ─── */}
      <div className="mt-3 mx-4 bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
        {[
          {
            icon: <Dumbbell className="h-5 w-5 text-brand-500" />,
            label: "我的计划",
            href: "/plans?tab=mine",
          },
          {
            icon: <Trophy className="h-5 w-5 text-amber-500" />,
            label: "我的记录",
            href: "/records",
          },
          {
            icon: <Users className="h-5 w-5 text-blue-500" />,
            label: "我的小队",
            href: "/teams",
          },
          {
            icon: <Bell className="h-5 w-5 text-red-400" />,
            label: "通知中心",
            href: "/notifications",
            badge: unreadCount > 0 ? unreadCount : undefined,
          },
        ].map((item, idx) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 hover:bg-surface-50 transition-colors",
              idx !== 3 && "border-b border-surface-50"
            )}
          >
            {item.icon}
            <span className="flex-1 text-sm text-surface-700">
              {item.label}
            </span>
            {item.badge ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1.5">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : (
              <ChevronRight className="h-4 w-4 text-surface-300" />
            )}
          </Link>
        ))}
      </div>

      {/* ─── 第三组：设置 ─── */}
      <div className="mt-3 mx-4 bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
        {[
          {
            icon: <Shield className="h-5 w-5 text-surface-400" />,
            label: "账号与安全",
            onClick: () => {},
            disabled: true,
          },
          {
            icon: <Calendar className="h-5 w-5 text-surface-400" />,
            label: "训练提醒设置",
            onClick: () => {},
            disabled: true,
          },
          {
            icon: <Moon className="h-5 w-5 text-surface-400" />,
            label: "主题切换",
            onClick: () => {},
            disabled: true,
          },
          {
            icon: <Info className="h-5 w-5 text-surface-400" />,
            label: "关于 FitSquad",
            onClick: () => {},
            disabled: true,
          },
        ].map((item, idx) => (
          <button
            key={item.label}
            onClick={item.onClick}
            disabled={item.disabled}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 w-full text-left hover:bg-surface-50 transition-colors disabled:opacity-60",
              idx !== 3 && "border-b border-surface-50"
            )}
          >
            {item.icon}
            <span className="flex-1 text-sm text-surface-700">
              {item.label}
            </span>
            {item.disabled ? (
              <span className="text-[10px] text-surface-300">即将开放</span>
            ) : (
              <ChevronRight className="h-4 w-4 text-surface-300" />
            )}
          </button>
        ))}
      </div>

      {/* ─── 退出登录 ─── */}
      <div className="mt-6 mx-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-red-100 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      </div>

      {/* 底部留白防止被 nav 遮挡 */}
      <div className="h-20" />
    </div>
  );
}
