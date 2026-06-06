import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatWeight } from "@/lib/utils";
import { ArrowLeft, Dumbbell, Clock, Play, Trash2 } from "lucide-react";
import { DeletePlanButton } from "./delete-button";

export default async function PlanDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await paramsPromise;

  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      days: {
        orderBy: { sortOrder: "asc" },
        include: {
          exercises: {
            orderBy: { sortOrder: "asc" },
            include: {
              exercise: {
                select: { id: true, name: true, category: true, muscleGroup: true, description: true },
              },
            },
          },
        },
      },
      team: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!plan) notFound();

  const isOwner = plan.createdById === session.user.id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/plans"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700"
      >
        <ArrowLeft className="h-4 w-4" /> 返回计划列表
      </Link>

      {/* 头部 */}
      <div className="mt-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">{plan.name}</h1>
            {plan.description && (
              <p className="mt-1 text-sm text-surface-500">{plan.description}</p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-surface-400">
              <span>创建者: {plan.createdBy.name}</span>
              {plan.team && <span>团队: {plan.team.name}</span>}
              {plan.isTemplate && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                  模板
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isOwner && !plan.isTemplate && (
              <DeletePlanButton planId={plan.id} />
            )}
          </div>
        </div>
      </div>

      {/* 训练日列表 */}
      <div className="mt-8 space-y-6">
        {plan.days.map((day) => (
          <div
            key={day.id}
            className="rounded-xl border border-surface-200 bg-white shadow-sm overflow-hidden"
          >
            <div className="bg-surface-50 px-5 py-3 border-b border-surface-100 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-surface-900">
                <Dumbbell className="h-4 w-4 text-brand-500" />
                {day.dayName}
              </h2>
              <Link
                href={`/train?planId=${plan.id}&dayId=${day.id}`}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition-colors"
              >
                <Play className="h-3.5 w-3.5" />
                练这天
              </Link>
            </div>
            <div className="divide-y divide-surface-100">
              {day.exercises.length === 0 ? (
                <p className="px-5 py-4 text-sm text-surface-400">
                  暂无动作
                </p>
              ) : (
                day.exercises.map((pe) => (
                  <div
                    key={pe.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900">
                        {pe.exercise.name}
                      </p>
                      <p className="text-xs text-surface-400">
                        {pe.exercise.muscleGroup} · {pe.exercise.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-surface-600">
                      <span>
                        {pe.sets} 组 × {pe.reps} 次
                      </span>
                      <span className="font-medium text-brand-600">
                        {formatWeight(pe.weight)}
                      </span>
                      <span className="flex items-center gap-1 text-surface-400">
                        <Clock className="h-3 w-3" />
                        {pe.restTime}s
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
