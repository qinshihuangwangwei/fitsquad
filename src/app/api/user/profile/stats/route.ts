import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/user/profile/stats — 用户聚合统计数据
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;

  const [totalSessions, totalSets, teamCount, recentSessions] =
    await Promise.all([
      prisma.workoutSession.count({
        where: { userId, status: "COMPLETED" },
      }),
      prisma.workoutSet.count({
        where: { session: { userId, status: "COMPLETED" }, completed: true },
      }),
      prisma.teamMember.count({
        where: { userId, status: "ACCEPTED" },
      }),
      prisma.workoutSession.findMany({
        where: { userId, status: "COMPLETED" },
        orderBy: { endedAt: "desc" },
        select: { endedAt: true },
      }),
    ]);

  // 计算连续打卡天数
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedDates = new Set(
    recentSessions
      .filter((s) => s.endedAt)
      .map((s) => {
        const d = new Date(s.endedAt!);
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
      })
  );

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    if (completedDates.has(checkDate.toISOString())) {
      streak++;
    } else {
      break;
    }
  }

  // 计算总训练容量
  const allSets = await prisma.workoutSet.findMany({
    where: { session: { userId, status: "COMPLETED" }, completed: true },
    select: { reps: true, weight: true },
  });
  const totalVolume = allSets.reduce((sum, s) => sum + s.reps * s.weight, 0);

  return NextResponse.json({
    data: {
      totalSessions,
      totalSets,
      totalVolume,
      streakDays: streak,
      teamCount,
    },
  });
}
