"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Trophy,
  Play,
  Bell,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";

const desktopLinks = [
  { href: "/dashboard", label: "主页", icon: LayoutDashboard },
  { href: "/teams", label: "团队", icon: Users },
  { href: "/plans", label: "计划", icon: Dumbbell },
  { href: "/train", label: "训练", icon: Play },
  { href: "/records", label: "纪录", icon: Trophy },
  { href: "/profile", label: "我的", icon: User },
];

const mobileLinks = [
  { href: "/dashboard", label: "首页", icon: LayoutDashboard },
  { href: "/teams", label: "团队", icon: Users },
  { href: "/train", label: "训练", icon: Play },
  { href: "/notifications", label: "消息", icon: Bell },
  { href: "/profile", label: "我的", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [inviteCount, setInviteCount] = useState(0);
  const [otherNotifyCount, setOtherNotifyCount] = useState(0);

  // 定期拉取通知计数
  useEffect(() => {
    if (!session?.user) return;
    const fetchCounts = () => {
      fetch("/api/notifications?unread=true&limit=50")
        .then((r) => r.json())
        .then((data) => {
          const notifications = data.data || [];
          const invites = notifications.filter(
            (n: { type: string }) => n.type === "TEAM_INVITE"
          ).length;
          setInviteCount(invites);
          setOtherNotifyCount(notifications.length - invites);
        })
        .catch(() => {});
    };
    fetchCounts();
    const id = setInterval(fetchCounts, 15000);
    return () => clearInterval(id);
  }, [session]);

  const totalUnread = inviteCount + otherNotifyCount;

  const publicPaths = ["/login", "/register"];
  if (publicPaths.includes(pathname) || pathname === "/") {
    return null;
  }

  if (!session?.user) return null;

  return (
    <>
      {/* 桌面端顶部导航 */}
      <header className="hidden md:flex items-center justify-between border-b border-surface-200 bg-white px-6 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-sm">
            F
          </div>
          <span className="font-bold text-surface-900">FitSquad</span>
        </Link>

        <div className="flex items-center gap-1">
          {desktopLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            const isTeams = link.href === "/teams";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-surface-500 hover:bg-surface-100 hover:text-surface-700"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
                {isTeams && inviteCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                    {inviteCount > 99 ? "99+" : inviteCount}
                  </span>
                )}
              </Link>
            );
          })}

          {/* 通知铃铛 */}
          <Link
            href="/notifications"
            className="relative rounded-lg p-2 text-surface-500 hover:bg-surface-100"
          >
            <Bell
              className={cn(
                "h-5 w-5 transition-transform",
                totalUnread > 0 && "animate-bell-shake"
              )}
            />
            {otherNotifyCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white px-1">
                {otherNotifyCount > 99 ? "99+" : otherNotifyCount}
              </span>
            )}
          </Link>

          <div className="ml-4 flex items-center gap-3">
            {/* 用户头像 */}
            <Link href="/dashboard" className="flex-shrink-0">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || ""}
                  className="h-8 w-8 rounded-full object-cover border-2 border-surface-200"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {session.user.name?.[0] || "U"}
                </div>
              )}
            </Link>
            <span className="text-sm text-surface-600">
              {session.user.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs text-surface-400 hover:text-surface-600"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* 移动端底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-200 bg-white md:hidden safe-area-bottom">
        <div className="flex items-center justify-around py-1.5">
          {mobileLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            const isTeams = link.href === "/teams";
            const isMessages = link.href === "/notifications";

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] transition-colors min-w-0",
                  isActive
                    ? "text-brand-600"
                    : "text-surface-400"
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {isTeams && inviteCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white px-0.5">
                      {inviteCount > 99 ? "99+" : inviteCount}
                    </span>
                  )}
                  {isMessages && totalUnread > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white px-0.5">
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                  )}
                </div>
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
