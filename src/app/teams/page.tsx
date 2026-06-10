import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeamCard } from "@/components/teams/TeamCard";
import { AcceptRejectButtons } from "@/components/teams/AcceptRejectButtons";
import { Plus, Users, UserPlus, ChevronRight } from "lucide-react";
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
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">我的团队</h1>
          <p className="mt-1 text-sm text-surface-500">
            与你并肩作战的伙伴们
          </p>
        </div>
        <Link
          href="/teams/new"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-button hover:shadow-buttonHover transition-all"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">创建团队</span>
        </Link>
      </div>

      {pendingInvites.length > 0 && (
        <div className="mt-6 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <UserPlus className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-amber-800">
                待处理的邀请 ({pendingInvites.length})
              </h2>
              <p className="text-xs text-amber-600">有人邀请你加入团队</p>
            </div>
          </div>

          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-surface-900 truncate">
                    {invite.team.name}
                  </p>
                  {invite.team.description && (
                    <p className="text-sm text-surface-500 truncate">
                      {invite.team.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-3">
                  <AcceptRejectButtons teamId={invite.teamId} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-surface-400" />
          <h2 className="font-semibold text-surface-700">我加入的团队</h2>
        </div>

        {teams.length === 0 && pendingInvites.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-surface-200 p-10 text-center">
            <Users className="mx-auto h-14 w-14 text-surface-300" />
            <p className="mt-4 text-surface-500">还没有加入任何团队</p>
            <Link
              href="/teams/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              创建团队
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="group block rounded-xl border border-surface-200 bg-white p-4 shadow-sm hover:border-brand-300 hover:shadow-cardHover hover:-translate-y-0.5 transition-all duration-300"
              >
                <TeamCard
                  team={team as unknown as import("@/types").TeamWithMembers}
                />
                <ChevronRight className="mt-2 ml-auto h-4 w-4 text-surface-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {teams.length === 0 && pendingInvites.length > 0 && (
        <div className="mt-6 rounded-xl border border-surface-200 bg-white p-6 text-center">
          <p className="text-sm text-surface-500">
            先接受一个邀请开始你的团队之旅吧
          </p>
        </div>
      )}
    </div>
  );
}
