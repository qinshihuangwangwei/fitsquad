import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Play } from "lucide-react";
import { redirect } from "next/navigation";
import { StartTrainingButton } from "./start-button";

export default async function TrainPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ planId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const searchParams = await searchParamsPromise;
  const planId = searchParams.planId;

  // 检查是否有活跃训练
  const activeSession = await prisma.workoutSession.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
    include: {
      plan: { select: { name: true } },
    },
  });

  // 如果指定了 planId，加载计划
  let plan = null;
  if (planId) {
    plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        days: {
          orderBy: { sortOrder: "asc" },
          include: {
            exercises: {
              orderBy: { sortOrder: "asc" },
              include: {
                exercise: {
                  select: { id: true, name: true, muscleGroup: true },
                },
              },
            },
          },
        },
      },
    });
  }

  // 用户的计划列表
  const myPlans = await prisma.plan.findMany({
    where: {
      OR: [
        { createdById: session.user.id, isTemplate: false },
        { isTemplate: true },
      ],
    },
    include: {
      days: {
        include: {
          exercises: { include: { exercise: { select: { name: true } } } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  // 用户的团队
  const myTeams = await prisma.team.findMany({
    where: {
      members: { some: { userId: session.user.id, status: "ACCEPTED" } },
    },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700"
      >
        <ArrowLeft className="h-4 w-4" /> 返回主页
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-surface-900">开始训练</h1>

      {/* 如果有活跃训练 */}
      {activeSession && (
        <div className="mt-4 rounded-xl border-2 border-brand-200 bg-brand-50 p-4">
          <p className="text-sm font-medium text-brand-800">
            ⚡ 你有一个活跃的训练会话
          </p>
          {activeSession.plan && (
            <p className="text-xs text-brand-600 mt-1">
              计划: {activeSession.plan.name}
            </p>
          )}
          <Link
            href={`/train/${activeSession.id}`}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Play className="h-4 w-4" />
            继续训练
          </Link>
        </div>
      )}

      {/* 通过计划训练 */}
      {plan && (
        <div className="mt-6 rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-surface-900">从计划开始</h2>
          <p className="text-sm text-surface-500 mt-1">
            {plan.name} · {plan.days.length} 个训练日 ·{" "}
            {plan.days.reduce((s, d) => s + d.exercises.length, 0)} 个动作
          </p>
          <StartTrainingButton planId={plan.id} />
        </div>
      )}

      {/* 快速选择计划 */}
      {!plan && (
        <div className="mt-6 space-y-4">
          <h2 className="font-semibold text-surface-900">选择训练计划</h2>
          <div className="grid gap-3">
            {myPlans.map((p) => (
              <Link
                key={p.id}
                href={`/train?planId=${p.id}`}
                className="flex items-center justify-between rounded-xl border border-surface-200 bg-white p-4 hover:border-brand-300 transition-colors"
              >
                <div>
                  <p className="font-medium text-surface-900">{p.name}</p>
                  <p className="text-xs text-surface-500">
                    {p.days.length} 天 ·{" "}
                    {p.days.reduce((s, d) => s + d.exercises.length, 0)} 个动作
                  </p>
                </div>
                <Play className="h-5 w-5 text-brand-500" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
