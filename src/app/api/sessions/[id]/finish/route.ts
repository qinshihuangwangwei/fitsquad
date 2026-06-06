import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/sessions/[id]/finish — 结束训练
export async function POST(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await paramsPromise;
  const workoutSession = await prisma.workoutSession.findUnique({
    where: { id },
  });

  if (!workoutSession) {
    return NextResponse.json({ error: "训练会话不存在" }, { status: 404 });
  }
  if (workoutSession.userId !== session.user.id) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }
  if (workoutSession.status !== "ACTIVE") {
    return NextResponse.json({ error: "训练已结束" }, { status: 400 });
  }

  // 计算总容量
  const completedSets = await prisma.workoutSet.findMany({
    where: { sessionId: id, completed: true },
  });
  const totalVolume = completedSets.reduce(
    (sum, s) => sum + s.reps * s.weight,
    0
  );
  const totalSets = await prisma.workoutSet.count({
    where: { sessionId: id },
  });
  const doneSets = completedSets.length;

  // 结束会话
  await prisma.workoutSession.update({
    where: { id },
    data: { status: "COMPLETED", endedAt: new Date() },
  });

  // 检查容量成就
  const volumeAchievements: Array<{ threshold: number; type: string }> = [
    { threshold: 10000, type: "VOLUME_10000" },
    { threshold: 5000, type: "VOLUME_5000" },
    { threshold: 1000, type: "VOLUME_1000" },
  ];

  for (const { threshold, type } of volumeAchievements) {
    if (totalVolume >= threshold) {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievement: {
            userId: session.user.id,
            achievement: type as any,
          },
        },
        create: { userId: session.user.id, achievement: type as any },
        update: {},
      });
    }
  }

  // 检查连续打卡
  await checkStreakAchievements(session.user.id);

  return NextResponse.json({
    data: {
      completed: true,
      totalVolume,
      doneSets,
      totalSets,
      endedAt: new Date(),
    },
  });
}

async function checkStreakAchievements(userId: string) {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { endedAt: "desc" },
    select: { endedAt: true },
  });

  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const completedDates = new Set(
    sessions
      .filter((s) => s.endedAt)
      .map((s) => {
        const d = new Date(s.endedAt!);
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
      })
  );

  for (let i = 0; i < 31; i++) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() - i);
    if (completedDates.has(checkDate.toISOString())) {
      streak++;
    } else {
      break;
    }
  }

  const streakAchievements = [
    { days: 30, type: "STREAK_30" },
    { days: 7, type: "STREAK_7" },
    { days: 3, type: "STREAK_3" },
  ];

  for (const { days, type } of streakAchievements) {
    if (streak >= days) {
      await prisma.userAchievement.upsert({
        where: { userId_achievement: { userId, achievement: type } },
        create: { userId, achievement: type },
        update: {},
      });
    }
  }
}
