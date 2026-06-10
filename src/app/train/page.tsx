import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Play, Plus, Dumbbell } from "lucide-react";
import { redirect } from "next/navigation";
import { StartTrainingButton } from "./start-button";

export default async function TrainPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ planId?: string; dayId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const searchParams = await searchParamsPromise;
  const planId = searchParams.planId;
  const dayId = searchParams.dayId;

  const activeSession = await prisma.workoutSession.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
    include: {
      plan: { select: { name: true } },
    },
  });

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

  const myTeams = await prisma.team.findMany({
    where: {
      members: { some: { userId: session.user.id, status: "ACCEPTED" } },
    },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-surface-600 hover:text-surface-800 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline">返回主页</span>
      </Link>

      <div className="mt-6">
        <h1 className="text-2xl font-bold text-surface-900">开始训练</h1>
        <p className="mt-1 text-sm text-surface-500">
          选择一个计划开始你的训练
        </p>
      </div>

      {activeSession && (
        <div className="mt-6 rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                  <Play className="h-3 w-3" />
                  活跃训练
                </span>
              </div>
              {activeSession.plan && (
                <p className="mt-3 text-base font-semibold text-surface-900">
                  {activeSession.plan.name}
                </p>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
              <Dumbbell className="h-5 w-5 text-brand-600" />
            </div>
          </div>
          <Link
            href={`/train/${activeSession.id}`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-base font-semibold text-white shadow-button hover:shadow-buttonHover transition-all"
          >
            <Play className="h-5 w-5" />
            继续训练
          </Link>
        </div>
      )}

      {plan && (
        <div className="mt-6 rounded-2xl border border-surface-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-surface-900">从计划开始</h2>
              <p className="mt-1 text-sm text-surface-500">
                {plan.name} · {plan.days.length} 个训练日 ·{" "}
                {plan.days.reduce((s, d) => s + d.exercises.length, 0)} 个动作
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-100">
              <Dumbbell className="h-5 w-5 text-surface-500" />
            </div>
          </div>
          <div className="mt-4">
            <StartTrainingButton planId={plan.id} dayId={dayId} />
          </div>
        </div>
      )}

      {!plan && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-surface-900">选择训练计划</h2>
            <Link
              href="/plans/new"
              className="flex items-center gap-1.5 rounded-lg bg-surface-100 px-3 py-2 text-xs font-medium text-surface-600 hover:bg-surface-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              创建
            </Link>
          </div>

          <div className="space-y-3">
            {myPlans.map((p) => (
              <Link
                key={p.id}
                href={`/train?planId=${p.id}`}
                className="group flex items-center gap-4 rounded-xl border border-surface-200 bg-white p-4 shadow-sm hover:border-brand-300 hover:shadow-cardHover hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-100 group-hover:bg-brand-50 transition-colors">
                  <Dumbbell className="h-6 w-6 text-surface-500 group-hover:text-brand-600 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-surface-900 truncate">
                    {p.name}
                  </p>
                  <p className="text-sm text-surface-500">
                    {p.days.length} 天 ·{" "}
                    {p.days.reduce((s, d) => s + d.exercises.length, 0)} 个动作
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-100 group-hover:bg-brand-100 transition-colors">
                  <Play className="h-4 w-4 text-surface-500 group-hover:text-brand-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          {myPlans.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-surface-200 p-10 text-center">
              <Dumbbell className="mx-auto h-12 w-12 text-surface-300" />
              <p className="mt-4 text-surface-500">还没有训练计划</p>
              <Link
                href="/plans/new"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                创建计划
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
