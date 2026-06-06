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
} from "lucide-react";
import { redirect } from "next/navigation";
import { calculateVolume } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // ─── 用户信息 ───
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      achievements: {
        select: { achievement: true, unlockedAt: true },
      },
    },
  });

  // ─── 统计 ───
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

  // 本周活跃天数
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

  // ─── 最近通知 ───
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // ─── 成就 ───
  const achievements = user?.achievements || [];

  // ─── 最近训练 ───
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* 欢迎 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          className="flex items-center gap-2 self-start rounded-xl bg-brand-600 px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-brand-700 transition-colors"
        >
          <Play className="h-4 w-4" />
          开始训练
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            icon: <Dumbbell className="h-5 w-5 text-brand-600" />,
            label: "训练次数",
            value: totalSessions,
          },
          {
            icon: <Trophy className="h-5 w-5 text-amber-500" />,
            label: "个人纪录",
            value: totalRecords,
          },
          {
            icon: <Users className="h-5 w-5 text-blue-500" />,
            label: "团队",
            value: teamCount,
          },
          {
            icon: <Flame className="h-5 w-5 text-orange-500" />,
            label: "训练总容量",
            value: `${(totalVolume / 1000).toFixed(1)}K KG`,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-surface-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              {stat.icon}
              <span className="text-xs text-surface-500">{stat.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-surface-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* 左侧：动态 + 最近训练 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 快捷操作 */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/teams/new"
              className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-4 shadow-sm hover:border-brand-300 transition-colors"
            >
              <Plus className="h-5 w-5 text-brand-500" />
              <div>
                <p className="text-sm font-medium text-surface-900">创建团队</p>
                <p className="text-xs text-surface-400">组建健身小队</p>
              </div>
            </Link>
            <Link
              href="/plans/new"
              className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-4 shadow-sm hover:border-brand-300 transition-colors"
            >
              <Plus className="h-5 w-5 text-brand-500" />
              <div>
                <p className="text-sm font-medium text-surface-900">创建计划</p>
                <p className="text-xs text-surface-400">定制训练方案</p>
              </div>
            </Link>
          </div>

          {/* 团队动态 */}
          <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-surface-900">团队动态</h2>
              <Link
                href="/teams"
                className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                查看全部 <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="mt-3">
              <ActivityFeed />
            </div>
          </div>

          {/* 最近训练 */}
          <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-surface-900">最近训练</h2>
            {recentSessions.length === 0 ? (
              <p className="mt-4 text-sm text-surface-400 text-center py-6">
                还没有训练记录
              </p>
            ) : (
              <div className="mt-3 divide-y divide-surface-100">
                {recentSessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-surface-900">
                        {s.plan?.name || "自由训练"}
                      </p>
                      <p className="text-xs text-surface-400">
                        {s._count.sets} 组 · {s.status === "COMPLETED" ? "✅ 已完成" : s.status === "ACTIVE" ? "🔄 进行中" : "❌ 已取消"}
                      </p>
                    </div>
                    {s.status === "ACTIVE" && (
                      <Link
                        href={`/train/${s.id}`}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        继续 →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右侧：成就 + 通知 */}
        <div className="space-y-8">
          {/* 成就 */}
          <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-surface-900">成就徽章</h2>
            <div className="mt-3">
              <BadgeGrid achievements={achievements} allAchievements />
            </div>
          </div>

          {/* 通知入口 */}
          <Link
            href="/notifications"
            className="block rounded-xl border border-surface-200 bg-white p-5 shadow-sm hover:border-brand-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-surface-900">通知</h2>
              <span className="text-xs text-brand-600">
                查看全部 →
              </span>
            </div>
            {notifications.length === 0 ? (
              <p className="mt-3 text-sm text-surface-400">
                暂无新通知
              </p>
            ) : (
              <div className="mt-3 space-y-1.5">
                {notifications.slice(0, 3).map((n) => (
                  <p key={n.id} className="text-xs text-surface-600 line-clamp-1">
                    {n.read ? "" : "● "}{n.message}
                  </p>
                ))}
                {notifications.length > 3 && (
                  <p className="text-xs text-surface-400">
                    还有 {notifications.length - 3} 条...
                  </p>
                )}
              </div>
            )}
          </Link>

          {/* 用户 ID 卡片 */}
          <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center">
            <p className="text-xs text-surface-400">你的用户 ID</p>
            <p className="mt-1 text-xs font-mono text-surface-600 break-all select-all">
              {userId}
            </p>
            <p className="mt-1 text-[10px] text-surface-400">
              将此 ID 分享给队长以接受团队邀请
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
