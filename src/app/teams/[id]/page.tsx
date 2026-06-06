import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeamMemberList } from "@/components/teams/TeamMemberList";
import { TeamInviteModalTrigger } from "./invite-trigger";
import { DissolveTeamButton } from "@/components/teams/DissolveTeamButton";
import { LeaveTeamButton } from "@/components/teams/LeaveTeamButton";
import { LeaderboardTable } from "@/components/records/LeaderboardTable";
import { ArrowLeft, Users, Calendar, Dumbbell } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function TeamDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await paramsPromise;

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      captain: {
        select: { id: true, name: true, avatar: true },
      },
      members: {
        where: { status: "ACCEPTED" },
        include: {
          user: {
            select: { id: true, name: true, avatar: true, bodyWeight: true },
          },
        },
      },
      _count: { select: { members: { where: { status: "ACCEPTED" } } } },
      plans: {
        take: 8,
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true, description: true },
      },
    },
  });

  if (!team) notFound();

  const userId = session.user!.id;
  const isCaptain = team.captainId === userId;
  const isMember = team.members.some((m) => m.userId === userId);
  if (!isMember) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-lg text-surface-600">你不是该团队的成员</p>
        <Link href="/teams" className="mt-4 inline-block text-brand-600">
          ← 返回团队列表
        </Link>
      </div>
    );
  }

  // 获取排行榜数据（Prisma ORM，SQLite 兼容）
  const memberIds = team.members.map((m) => m.userId);
  const allRecords = memberIds.length > 0
    ? await prisma.personalRecord.findMany({
        where: { userId: { in: memberIds } },
        include: {
          exercise: { select: { id: true, name: true, muscleGroup: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { weight: "desc" },
      })
    : [];

  // 每个动作取最佳纪录（按 weight 降序已排序，取第一个）
  const bestByExercise = new Map<string, typeof allRecords[0]>();
  for (const r of allRecords) {
    if (!bestByExercise.has(r.exerciseId)) {
      bestByExercise.set(r.exerciseId, r);
    }
  }

  const leaderboard = [...bestByExercise.values()].map((r) => ({
    exerciseId: r.exerciseId,
    exerciseName: r.exercise.name,
    muscleGroup: r.exercise.muscleGroup,
    bestUserId: r.userId,
    bestUserName: r.user.name,
    bestWeight: r.weight,
    bestReps: r.reps,
    achievedAt: r.achievedAt,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 返回导航 */}
      <Link
        href="/teams"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700"
      >
        <ArrowLeft className="h-4 w-4" /> 返回团队列表
      </Link>

      {/* 团队头部 */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-2xl font-bold text-brand-700">
            {team.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">
              {team.name}
            </h1>
            <p className="mt-1 text-sm text-surface-500">
              队长: {team.captain.name} · 创建于 {formatDate(team.createdAt)}
            </p>
            <div className="mt-2 flex items-center gap-4 text-xs text-surface-400">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {team._count.members} 名成员
              </span>
              <span className="flex items-center gap-1">
                <Dumbbell className="h-3.5 w-3.5" />
                {team.plans.length} 个训练计划
              </span>
            </div>
          </div>
        </div>
        {isCaptain ? (
          <div className="flex gap-2">
            <TeamInviteModalTrigger teamId={team.id} teamName={team.name} />
            <DissolveTeamButton teamId={team.id} teamName={team.name} />
          </div>
        ) : (
          <LeaveTeamButton teamId={team.id} teamName={team.name} />
        )}
      </div>

      {team.description && (
        <p className="mt-4 text-sm text-surface-600 bg-surface-50 rounded-xl p-4">
          {team.description}
        </p>
      )}

      {/* 成员与排行榜 */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* 成员列表 */}
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-surface-900">
            <Users className="h-5 w-5 text-brand-500" />
            团队成员
          </h2>
          <div className="mt-4">
            <TeamMemberList
              members={team.members}
              captainId={team.captainId}
              currentUserId={session.user.id}
              teamId={team.id}
            />
          </div>
        </div>

        {/* 排行榜 */}
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-surface-900">
            <Calendar className="h-5 w-5 text-brand-500" />
            队内排行榜
          </h2>
          <div className="mt-4">
            {leaderboard.length > 0 ? (
              <LeaderboardTable data={leaderboard} />
            ) : (
              <p className="text-sm text-surface-400">
                暂无纪录数据，开始训练创下你的第一个纪录吧！
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 关联计划 */}
      {team.plans.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-surface-900">团队训练计划</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {team.plans.map((plan) => (
              <Link
                key={plan.id}
                href={`/plans/${plan.id}`}
                className="rounded-lg border border-surface-200 p-4 hover:border-brand-300 transition-colors"
              >
                <p className="font-medium text-surface-900">{plan.name}</p>
                {plan.description && (
                  <p className="mt-1 text-xs text-surface-500 line-clamp-1">
                    {plan.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
