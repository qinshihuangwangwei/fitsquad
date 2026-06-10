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
  User,
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

  useEffect(() => {
    fetch("/api/user/profile/stats")
      .then((r) => r.json())
      .then((data) => setStats(data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      fetch("/api/notifications?unread=true&limit=1")
        .then((r) => r.json())
        .then((data) => setUnreadCount(data.unreadCount || 0))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(id);
  }, []);

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

  const menuItems = [
    { icon: <Dumbbell className="h-5 w-5 text-brand-500" />, label: "我的计划", href: "/plans?tab=mine" },
    { icon: <Trophy className="h-5 w-5 text-amber-500" />, label: "我的记录", href: "/records" },
    { icon: <Users className="h-5 w-5 text-blue-500" />, label: "我的小队", href: "/teams" },
    { icon: <Bell className="h-5 w-5 text-red-400" />, label: "通知中心", href: "/notifications", badge: unreadCount > 0 ? unreadCount : undefined },
  ];

  const settingItems = [
    { icon: <Shield className="h-5 w-5 text-surface-400" />, label: "账号与安全", onClick: () => {}, disabled: true },
    { icon: <Calendar className="h-5 w-5 text-surface-400" />, label: "训练提醒设置", onClick: () => {}, disabled: true },
    { icon: <Moon className="h-5 w-5 text-surface-400" />, label: "主题切换", onClick: () => {}, disabled: true },
    { icon: <Info className="h-5 w-5 text-surface-400" />, label: "关于 FitSquad", onClick: () => {}, disabled: true },
  ];

  return (
    <div className="mx-auto max-w-lg pb-20">
      <div className="flex flex-col items-center px-4 pt-8 pb-6 bg-gradient-to-br from-brand-500 to-brand-700">
        <label className="relative cursor-pointer group">
          <div className="relative">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user.name}
                className="h-24 w-24 rounded-full object-cover border-4 border-white/50 shadow-lg"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-4xl font-bold text-white border-4 border-white/50">
                {user.name[0]}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <User className="h-4 w-4 text-surface-600" />
          </div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </label>

        <h1 className="mt-4 text-xl font-bold text-white">{user.name}</h1>
        <p className="mt-1 text-sm text-white/70">
          {user.bio || "这个人很懒，什么都没写…"}
        </p>

        <div className="mt-3 flex items-center gap-4 text-xs text-white/60">
          <span>ID: {user.id.slice(0, 8)}...</span>
          <span>加入于 {formatDate(user.createdAt)}</span>
          {user.bodyWeight && (
            <span className="bg-white/20 rounded-full px-2 py-0.5">体重: {user.bodyWeight} KG</span>
          )}
        </div>
      </div>

      <div className="mx-4 -mt-4 rounded-2xl border border-surface-200 bg-white shadow-card overflow-hidden">
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
              <span className="mt-1.5 text-xl font-bold text-surface-900">
                {item.value}
              </span>
              <span className="text-xs text-surface-400">{item.label}</span>
            </Link>
          ))}
        </div>

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
              <span className="text-lg font-semibold text-surface-700">
                {item.value}
              </span>
              <span className="text-xs text-surface-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 mx-4 rounded-2xl border border-surface-200 bg-white shadow-card overflow-hidden">
        {menuItems.map((item, idx) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-4 py-4 hover:bg-surface-50 transition-colors",
              idx !== menuItems.length - 1 && "border-b border-surface-50"
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-100">
              {item.icon}
            </div>
            <span className="flex-1 text-base font-medium text-surface-900">
              {item.label}
            </span>
            {item.badge ? (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white px-2">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : (
              <ChevronRight className="h-5 w-5 text-surface-300" />
            )}
          </Link>
        ))}
      </div>

      <div className="mt-4 mx-4 rounded-2xl border border-surface-200 bg-white shadow-card overflow-hidden">
        {settingItems.map((item, idx) => (
          <button
            key={item.label}
            onClick={item.onClick}
            disabled={item.disabled}
            className={cn(
              "flex items-center gap-4 px-4 py-4 w-full text-left hover:bg-surface-50 transition-colors disabled:opacity-50",
              idx !== settingItems.length - 1 && "border-b border-surface-50"
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-100">
              {item.icon}
            </div>
            <span className="flex-1 text-base font-medium text-surface-900">
              {item.label}
            </span>
            {item.disabled ? (
              <span className="text-xs text-surface-300">即将开放</span>
            ) : (
              <ChevronRight className="h-5 w-5 text-surface-300" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 mx-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-50 border border-red-200 py-3.5 text-base font-medium text-red-600 hover:bg-red-100 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          退出登录
        </button>
      </div>

      <div className="h-20" />
    </div>
  );
}
