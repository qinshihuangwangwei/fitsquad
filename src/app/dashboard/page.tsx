import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActivityFeed } from "@/components/feed/ActivityFeed";
import { BadgeGrid } from "@/components/achievements/BadgeGrid";
import { AvatarUpload } from "@/components/user/AvatarUpload";
import {
  Dumbbell,
  Users,
  Trophy,
  Flame,
  Play,
  Plus,
  ArrowRight,
  TrendingUp,
  Target,
} from "lucide-react";
import { redirect } from "next/navigation";
import { calculateVolume } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      achievements: {
        select: { achievement: true, unlockedAt: true },
      },
    },
  });

  const totalSessions = await prisma.workoutSession.count({
    where: { userId, status: "COMPLETED" },
  });

  const completedSets = await prisma.workoutSet.findMany({
    where: { session: { userId, status: "COMPLETED" }, completed: true },
    select: { reps: true, weight: true },
  });
  const totalVolume = calculateVolume(completedSets);

  const totalRecords = await prisma.personalRecord.count({
    where: { userId },
  });

  const teamCount = await prisma.teamMember.count({
    where: { userId, status: "ACCEPTED" },
  });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekSessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      status: "COMPLETED",
      endedAt: { gte: weekStart },
    },
    select: { endedAt: true },
  });

  const activeDays = new Set(
    weekSessions
      .filter((s) => s.endedAt)
      .map((s) => {
        const d = new Date(s.endedAt!);
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
      })
  ).size;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const achievements = user?.achievements || [];

  const recentSessions = await prisma.workoutSession.findMany({
    where: { userId },
    include: {
      plan: { select: { name: true } },
      _count: { select: { sets: true } },
    },
    orderBy: { startedAt: "desc" },
    take: 5,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-4">
          <AvatarUpload
            currentAvatar={user?.avatar}
            userName={user?.name || session.user.name || "U"}
          />
          <div>
            <h1 className="text-2xl font-bold text-surface-900">
              你好，{user?.name || session.user.name}
              <span className="ml-2">💪</span>
            </h1>
            <p className="mt-1 text-sm text-surface-500">
              {totalSessions === 0
                ? "准备开始你的第一次训练吧！"
                : `已完成 ${totalSessions} 次训练 · 本周活跃 ${activeDays} 天`}
            </p>
          </div>
        </div>
        <Link
          href="/train"
          className="group flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-base font-semibold text-white shadow-button hover:shadow-buttonHover hover:scale-105 transition-all duration-300"
        >
          <Play className="h-5 w-5" />
          开始训练
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        {[
          {
            icon: <Dumbbell className="h-6 w-6 text-brand-600" />,
            label: "训练次数",
            value: totalSessions,
            color: "bg-brand-50",
            trend: "+12%",
            trendUp: true,
          },
          {
            icon: <Trophy className="h-6 w-6 text-amber-500" />,
            label: "个人纪录",
            value: totalRecords,
            color: "bg-amber-50",
            trend: "+8%",
            trendUp: true,
          },
          {
            icon: <Users className="h-6 w-6 text-accent-blue-500" />,
            label: "团队",
            value: teamCount,
            color: "bg-accent-blue-50",
            trend: null,
            trendUp: true,
          },
          {
            icon: <Flame className="h-6 w-6 text-accent-orange-500" />,
            label: "训练总容量",
            value: `${(totalVolume / 1000).toFixed(1)}K KG`,
            color: "bg-accent-orange-50",
            trend: "+15%",
            trendUp: true,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-surface-200 bg-white p-5 shadow-card hover:shadow-cardHover hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
              {stat.trend && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.trendUp ? "text-green-600" : "text-red-500"}`}>
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="mt-3 text-xs text-surface-500">{stat.label}</p>
            <p className="mt-1.5 text-3xl font-bold text-surface-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/teams/new"
              className="group flex items-center gap-4 rounded-2xl border-2 border-surface-200 bg-white p-5 shadow-card hover:border-brand-300 hover:shadow-cardHover hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-6 w-6 text-brand-600" />
              </div>
              <div className="text-left">
                <p className="text-base font-semibold text-surface-900">创建团队</p>
                <p className="text-sm text-surface-400">组建健身小队</p>
              </div>
            </Link>
            <Link
              href="/plans/new"
              className="group flex items-center gap-4 rounded-2xl border-2 border-surface-200 bg-white p-5 shadow-card hover:border-brand-300 hover:shadow-cardHover hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-blue-100 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-6 w-6 text-accent-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-base font-semibold text-surface-900">创建计划</p>
                <p className="text-sm text-surface-400">定制训练方案</p>
              </div>
            </Link>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">团队动态</h2>
              <Link
                href="/teams"
                className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                查看全部 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4">
              <ActivityFeed />
            </div>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card">
            <h2 className="text-lg font-semibold text-surface-900">最近训练</h2>
            {recentSessions.length === 0 ? (
              <div className="mt-6 flex flex-col items-center justify-center py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-100">
                  <Dumbbell className="h-8 w-8 text-surface-400" />
                </div>
                <p className="mt-4 text-sm text-surface-400">还没有训练记录</p>
                <Link
                  href="/train"
                  className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  开始第一次训练 →
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentSessions.map((s, index) => (
                  <div
                    key={s.id}
                    className="group flex items-center justify-between p-4 rounded-xl hover:bg-surface-50 transition-colors duration-200"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.status === "ACTIVE" ? "bg-brand-100" : "bg-surface-100"}`}>
                        {s.status === "ACTIVE" ? (
                          <Play className="h-5 w-5 text-brand-600" />
                        ) : s.status === "COMPLETED" ? (
                          <Dumbbell className="h-5 w-5 text-surface-500" />
                        ) : (
                          <Dumbbell className="h-5 w-5 text-surface-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-base font-medium text-surface-900">
                          {s.plan?.name || "自由训练"}
                        </p>
                        <p className="text-sm text-surface-400">
                          {s._count.sets} 组 · {s.status === "COMPLETED" ? "✅ 已完成" : s.status === "ACTIVE" ? "🔄 进行中" : "❌ 已取消"}
                        </p>
                      </div>
                    </div>
                    {s.status === "ACTIVE" && (
                      <Link
                        href={`/train/${s.id}`}
                        className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        继续 <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card">
            <h2 className="text-lg font-semibold text-surface-900">成就徽章</h2>
            <div className="mt-4">
              <BadgeGrid achievements={achievements} allAchievements />
            </div>
          </div>

          <Link
            href="/notifications"
            className="block rounded-2xl border border-surface-200 bg-white p-6 shadow-card hover:border-brand-300 hover:shadow-cardHover transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">通知</h2>
              <span className="text-sm font-medium text-brand-600">
                查看全部 →
              </span>
            </div>
            {notifications.length === 0 ? (
              <div className="mt-4 text-center py-4">
                <p className="text-sm text-surface-400">暂无新通知</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {notifications.slice(0, 3).map((n) => (
                  <p
                    key={n.id}
                    className={`text-sm ${n.read ? "text-surface-500" : "text-surface-700 font-medium"} line-clamp-2`}
                  >
                    {!n.read && <span className="inline-block w-2 h-2 rounded-full bg-brand-500 mr-2 align-middle" />}
                    {n.message}
                  </p>
                ))}
                {notifications.length > 3 && (
                  <p className="text-sm text-surface-400">
                    还有 {notifications.length - 3} 条...
                  </p>
                )}
              </div>
            )}
          </Link>

          <div className="rounded-2xl border border-surface-200 bg-gradient-to-br from-surface-50 to-white p-5">
            <p className="text-sm font-medium text-surface-600">你的用户 ID</p>
            <p className="mt-2 text-sm font-mono text-surface-700 break-all select-all">
              {userId}
            </p>
            <p className="mt-2 text-xs text-surface-400">
              将此 ID 分享给队长以接受团队邀请
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
