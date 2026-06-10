import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlanCard } from "@/components/plans/PlanCard";
import { Plus, BookOpen, Grid3X3, FileText } from "lucide-react";
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

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">训练计划</h1>
          <p className="mt-1 text-sm text-surface-500">
            创建和管理你的训练计划
          </p>
        </div>
        <Link
          href="/plans/new"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-button hover:shadow-buttonHover transition-all"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">创建计划</span>
        </Link>
      </div>

      <div className="mt-6 flex rounded-xl bg-surface-100 p-1">
        <Link
          href="/plans?tab=mine"
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === "mine"
              ? "bg-white text-surface-900 shadow-sm"
              : "text-surface-500 hover:text-surface-700"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>我的计划</span>
          {myPlans.length > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "mine" ? "bg-brand-100 text-brand-700" : "bg-surface-200 text-surface-600"
            }`}>
              {myPlans.length}
            </span>
          )}
        </Link>
        <Link
          href="/plans?tab=templates"
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === "templates"
              ? "bg-white text-surface-900 shadow-sm"
              : "text-surface-500 hover:text-surface-700"
          }`}
        >
          <Grid3X3 className="h-4 w-4" />
          <span>模板库</span>
        </Link>
      </div>

      <div className="mt-6">
        {activeTab === "mine" && (
          <div className="space-y-3">
            {myPlans.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-surface-200 p-10 text-center">
                <BookOpen className="mx-auto h-14 w-14 text-surface-300" />
                <p className="mt-4 text-surface-500">还没有创建任何训练计划</p>
                <Link
                  href="/plans/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  创建你的第一个计划
                </Link>
              </div>
            ) : (
              myPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="group rounded-xl border border-surface-200 bg-white p-4 shadow-sm hover:border-brand-300 hover:shadow-cardHover hover:-translate-y-0.5 transition-all duration-300"
                >
                  <PlanCard plan={plan as unknown as PlanWithDays} />
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "templates" && (
          <div className="space-y-3">
            {templates.map((plan) => (
              <div
                key={plan.id}
                className="group rounded-xl border border-surface-200 bg-white p-4 shadow-sm hover:border-brand-300 hover:shadow-cardHover hover:-translate-y-0.5 transition-all duration-300"
              >
                <PlanCard plan={plan as unknown as PlanWithDays} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
