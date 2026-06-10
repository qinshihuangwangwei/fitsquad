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
  Settings,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalUnread = inviteCount + otherNotifyCount;

  const publicPaths = ["/login", "/register"];
  if (publicPaths.includes(pathname) || pathname === "/") {
    return null;
  }

  if (!session?.user) return null;

  return (
    <>
      <header className="hidden md:flex items-center justify-between border-b border-surface-200/50 bg-white/80 backdrop-blur-lg px-6 py-3 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
            <Dumbbell className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-surface-900">FitSquad</span>
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
                  "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brand-50 text-brand-700 shadow-sm"
                    : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
                {isTeams && inviteCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white px-1.5 animate-pulse">
                    {inviteCount > 99 ? "99+" : inviteCount}
                  </span>
                )}
              </Link>
            );
          })}

          <Link
            href="/notifications"
            className="relative ml-2 rounded-xl p-2.5 text-surface-600 hover:bg-surface-100 transition-all duration-200"
          >
            <Bell
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                totalUnread > 0 && "animate-bell-shake"
              )}
            />
            {otherNotifyCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white px-1.5">
                {otherNotifyCount > 99 ? "99+" : otherNotifyCount}
              </span>
            )}
          </Link>

          <div className="relative ml-4 flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-surface-100 transition-all duration-200"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || ""}
                    className="h-9 w-9 rounded-full object-cover border-2 border-surface-200"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-sm font-bold text-brand-700">
                    {session.user.name?.[0] || "U"}
                  </div>
                )}
                <span className="text-sm font-medium text-surface-700">
                  {session.user.name}
                </span>
                <ChevronDown className={`h-4 w-4 text-surface-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-surface-200 bg-white shadow-cardHover py-1 z-50 animate-slide-down">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    个人资料
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    设置
                  </Link>
                  <hr className="border-surface-100 my-1" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-200/50 bg-white/95 backdrop-blur-lg md:hidden safe-area-bottom">
        <div className="flex items-center justify-around py-2">
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
                  "relative flex flex-col items-center gap-1 px-3 py-1.5 text-xs transition-all duration-200",
                  isActive
                    ? "text-brand-600"
                    : "text-surface-400"
                )}
              >
                <div className="relative">
                  <Icon className={`h-6 w-6 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                  {isTeams && inviteCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1 animate-pulse">
                      {inviteCount > 99 ? "99+" : inviteCount}
                    </span>
                  )}
                  {isMessages && totalUnread > 0 && (
                    <span className="absolute -top-2 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                  )}
                </div>
                <span className="font-medium truncate max-w-16">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
