import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeamCard } from "@/components/teams/TeamCard";
import { AcceptRejectButtons } from "@/components/teams/AcceptRejectButtons";
import { Plus, Users } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TeamsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const teams = await prisma.team.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
          status: "ACCEPTED",
        },
      },
    },
    include: {
      captain: {
        select: { id: true, name: true, avatar: true },
      },
      _count: {
        select: { members: { where: { status: "ACCEPTED" } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // 获取待处理的邀请
  const pendingInvites = await prisma.teamMember.findMany({
    where: {
      userId: session.user.id,
      status: "PENDING",
    },
    include: {
      team: {
        select: { id: true, name: true, description: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">我的团队</h1>
          <p className="mt-1 text-sm text-surface-500">
            与你并肩作战的伙伴们
          </p>
        </div>
        <Link
          href="/teams/new"
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          创建团队
        </Link>
      </div>

      {/* 待处理邀请 */}
      {pendingInvites.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <Users className="h-4 w-4" />
            待处理的邀请 ({pendingInvites.length})
          </h2>
          <div className="mt-3 space-y-2">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm"
              >
                <div>
                  <p className="text-sm font-medium text-surface-900">
                    {invite.team.name}
                  </p>
                  {invite.team.description && (
                    <p className="text-xs text-surface-500">
                      {invite.team.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <AcceptRejectButtons
                    teamId={invite.teamId}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 团队列表 */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {teams.length === 0 && pendingInvites.length === 0 ? (
          <div className="col-span-2 rounded-xl border-2 border-dashed border-surface-200 p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-surface-300" />
            <p className="mt-3 text-sm text-surface-500">
              还没有加入任何团队
            </p>
            <Link
              href="/teams/new"
              className="mt-2 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              创建一个团队 →
            </Link>
          </div>
        ) : (
          teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team as unknown as import("@/types").TeamWithMembers}
            />
          ))
        )}
        {teams.length === 0 && pendingInvites.length > 0 && (
          <div className="col-span-2 rounded-xl border-2 border-dashed border-surface-200 p-12 text-center">
            <p className="text-sm text-surface-500">
              先接受一个邀请开始你的团队之旅吧
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


