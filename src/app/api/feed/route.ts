import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/feed — 获取动态流（用户的团队活动）
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

    // 获取用户所在的团队
    const memberships = await prisma.teamMember.findMany({
      where: { userId: session.user.id, status: "ACCEPTED" },
      select: { teamId: true },
    });
    const teamIds = teamId ? [teamId] : memberships.map((t) => t.teamId);

    // 没有团队则返回空
    if (teamIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // 获取这些团队最近的训练完成情况
    const recentSets = await prisma.workoutSet.findMany({
      where: {
        completed: true,
        completedAt: { not: null },
        session: { teamId: { in: teamIds } },
      },
      include: {
        exercise: { select: { id: true, name: true } },
        session: {
          select: {
            userId: true,
            user: { select: { name: true, avatar: true } },
            team: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { completedAt: "desc" },
      take: limit,
    });

    // 获取团队所有成员 ID
    const teamMembers = await prisma.teamMember.findMany({
      where: { teamId: { in: teamIds }, status: "ACCEPTED" },
      select: { userId: true },
    });
    const memberIds = teamMembers.map((m) => m.userId);

    // 获取最近的纪录突破
    const recentRecords = memberIds.length > 0
      ? await prisma.personalRecord.findMany({
          where: { userId: { in: memberIds } },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            exercise: { select: { id: true, name: true } },
          },
          orderBy: { achievedAt: "desc" },
          take: limit,
        })
      : [];

    // 获取最近加入的成员
    const recentJoins = await prisma.teamMember.findMany({
      where: { teamId: { in: teamIds }, status: "ACCEPTED" },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        team: { select: { id: true, name: true } },
      },
      orderBy: { joinedAt: "desc" },
      take: 5,
    });

    // 合并并排序
    const feedItems = [
      ...recentSets.map((s) => ({
        id: `set-${s.id}`,
        type: "workout_completed" as const,
        message: `${s.session.user.name} 完成了 ${s.exercise.name}: ${s.weight}KG × ${s.reps}次`,
        userName: s.session.user.name,
        userAvatar: s.session.user.avatar,
        teamName: s.session.team?.name,
        createdAt: s.completedAt!,
      })),
      ...recentRecords.map((r) => ({
        id: `record-${r.id}`,
        type: "record_broken" as const,
        message: `${r.user.name} 刷新了 ${r.exercise.name} 个人纪录: ${r.weight}KG × ${r.reps}次`,
        userName: r.user.name,
        userAvatar: r.user.avatar,
        createdAt: r.achievedAt,
      })),
      ...recentJoins.map((j) => ({
        id: `join-${j.id}`,
        type: "team_joined" as const,
        message: `${j.user.name} 加入了「${j.team.name}」`,
        userName: j.user.name,
        userAvatar: j.user.avatar,
        teamName: j.team.name,
        createdAt: j.joinedAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return NextResponse.json({ data: feedItems });
  } catch (err: any) {
    console.error("Feed error:", err);
    return NextResponse.json({ data: [] });
  }
}
