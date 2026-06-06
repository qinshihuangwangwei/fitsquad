import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecordCard } from "@/components/records/RecordCard";
import { ArrowLeft, Trophy } from "lucide-react";
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

  // 按部位分组
  const grouped: Record<string, typeof records> = {};
  for (const r of records) {
    const group = r.exercise.muscleGroup || "其他";
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(r);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700"
      >
        <ArrowLeft className="h-4 w-4" /> 返回主页
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <Trophy className="h-8 w-8 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold text-surface-900">个人纪录</h1>
          <p className="text-sm text-surface-500">
            共 {records.length} 项纪录
          </p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="mt-12 rounded-xl border-2 border-dashed border-surface-200 p-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-surface-300" />
          <p className="mt-3 text-surface-500">还没有任何个人纪录</p>
          <p className="text-xs text-surface-400 mt-1">
            开始训练并在训练中刷新自己的最好成绩
          </p>
          <Link
            href="/train"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white"
          >
            开始训练
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">
                {group}
              </h2>
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
