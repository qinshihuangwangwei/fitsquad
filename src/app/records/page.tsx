import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecordCard } from "@/components/records/RecordCard";
import { ArrowLeft, Trophy, TrendingUp, Target } from "lucide-react";
import { redirect } from "next/navigation";

export default async function RecordsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const records = await prisma.personalRecord.findMany({
    where: { userId: session.user.id },
    include: {
      exercise: {
        select: { id: true, name: true, category: true, muscleGroup: true },
      },
    },
    orderBy: [{ exercise: { muscleGroup: "asc" } }, { weight: "desc" }],
  });

  const grouped: Record<string, typeof records> = {};
  for (const r of records) {
    const group = r.exercise.muscleGroup || "其他";
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(r);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-surface-600 hover:text-surface-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden sm:inline">返回主页</span>
        </Link>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-xs text-green-600 font-medium">持续突破中</span>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600">
          <Trophy className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">个人纪录</h1>
          <p className="text-sm text-surface-500">
            共 {records.length} 项纪录
          </p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-surface-200 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-100 mx-auto">
            <Target className="h-8 w-8 text-surface-400" />
          </div>
          <p className="mt-4 text-surface-500">还没有任何个人纪录</p>
          <p className="text-sm text-surface-400 mt-2">
            开始训练并在训练中刷新自己的最好成绩
          </p>
          <Link
            href="/train"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-base font-semibold text-white shadow-button hover:shadow-buttonHover transition-all"
          >
            <Trophy className="h-5 w-5" />
            开始训练
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1.5 w-6 rounded-full bg-brand-500" />
                <h2 className="text-sm font-semibold text-surface-600 uppercase tracking-wider">
                  {group}
                </h2>
                <span className="text-xs text-surface-400">({items.length})</span>
              </div>
              <div className="space-y-2">
                {items.map((r, i) => (
                  <RecordCard
                    key={r.id}
                    exerciseName={r.exercise.name}
                    muscleGroup={r.exercise.muscleGroup}
                    weight={r.weight}
                    reps={r.reps}
                    achievedAt={r.achievedAt}
                    rank={i + 1}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
