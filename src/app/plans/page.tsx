import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlanCard } from "@/components/plans/PlanCard";
import { Plus, BookOpen } from "lucide-react";
import { PlanWithDays } from "@/types";
import { redirect } from "next/navigation";

export default async function PlansPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const searchParams = await searchParamsPromise;
  const activeTab = searchParams.tab || "mine";

  // 我的计划
  const myPlans = await prisma.plan.findMany({
    where: { createdById: session.user.id, isTemplate: false },
    include: {
      days: {
        orderBy: { sortOrder: "asc" },
        include: {
          exercises: {
            include: {
              exercise: { select: { id: true, name: true } },
            },
          },
        },
      },
      team: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // 模板计划
  const templates = await prisma.plan.findMany({
    where: { isTemplate: true },
    include: {
      days: {
        orderBy: { sortOrder: "asc" },
        include: {
          exercises: {
            include: {
              exercise: { select: { id: true, name: true } },
            },
          },
        },
      },
      team: { select: { id: true, name: true } },
    },
  });

  const myTeams = await prisma.team.findMany({
    where: {
      members: { some: { userId: session.user.id, status: "ACCEPTED" } },
    },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">训练计划</h1>
          <p className="mt-1 text-sm text-surface-500">
            创建和管理你的训练计划
          </p>
        </div>
        <Link
          href="/plans/new"
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          创建计划
        </Link>
      </div>

      {/* 标签切换 */}
      <div className="mt-6 flex gap-1 rounded-lg bg-surface-100 p-1">
        <Link
          href="/plans?tab=mine"
          className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors ${
            activeTab === "mine"
              ? "bg-white text-surface-900 shadow-sm"
              : "text-surface-500 hover:text-surface-700"
          }`}
        >
          我的计划
        </Link>
        <Link
          href="/plans?tab=templates"
          className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors ${
            activeTab === "templates"
              ? "bg-white text-surface-900 shadow-sm"
              : "text-surface-500 hover:text-surface-700"
          }`}
        >
          模板库
        </Link>
      </div>

      {/* 内容区 */}
      <div className="mt-6">
        {activeTab === "mine" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {myPlans.length === 0 ? (
              <div className="col-span-2 rounded-xl border-2 border-dashed border-surface-200 p-12 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-surface-300" />
                <p className="mt-3 text-sm text-surface-500">
                  还没有创建任何训练计划
                </p>
                <Link
                  href="/plans/new"
                  className="mt-2 inline-block text-sm font-medium text-brand-600"
                >
                  创建你的第一个计划 →
                </Link>
              </div>
            ) : (
              myPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan as unknown as PlanWithDays} />
              ))
            )}
          </div>
        )}

        {activeTab === "templates" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {templates.map((plan) => (
              <PlanCard key={plan.id} plan={plan as unknown as PlanWithDays} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
