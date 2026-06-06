import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/teams/[id]/leaderboard — 团队排行榜
export async function GET(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await paramsPromise;

  // 验证是团队成员
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: { teamId: id, userId: session.user.id },
    },
  });
  if (!membership || membership.status !== "ACCEPTED") {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const sortBy = searchParams.get("sortBy") || "weight"; // weight | reps | date
  const exerciseId = searchParams.get("exerciseId");

  // 获取团队所有成员的纪录
  const members = await prisma.teamMember.findMany({
    where: { teamId: id, status: "ACCEPTED" },
    select: { userId: true },
  });
  const memberIds = members.map((m) => m.userId);

  if (memberIds.length === 0) {
    return NextResponse.json({ data: [] });
  }

  // Prisma ORM 查询（SQLite 兼容）
  const orderByField = sortBy === "reps" ? { reps: "desc" as const } : sortBy === "date" ? { achievedAt: "desc" as const } : { weight: "desc" as const };

  const records = await prisma.personalRecord.findMany({
    where: {
      userId: { in: memberIds },
      ...(exerciseId ? { exerciseId } : {}),
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      exercise: { select: { id: true, name: true, muscleGroup: true } },
    },
    orderBy: orderByField,
    take: 50,
  });

  const leaderboard = records.map((r) => ({
    userId: r.userId,
    userName: r.user.name,
    userAvatar: r.user.avatar,
    exerciseId: r.exerciseId,
    exerciseName: r.exercise.name,
    muscleGroup: r.exercise.muscleGroup,
    weight: r.weight,
    reps: r.reps,
    achievedAt: r.achievedAt,
  }));

  return NextResponse.json({ data: leaderboard });
}
