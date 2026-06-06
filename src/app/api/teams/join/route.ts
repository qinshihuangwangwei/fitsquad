import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/teams/join — 接受或拒绝团队邀请
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const { teamId, action } = body as { teamId: string; action: "accept" | "reject" };

  if (!teamId || !["accept", "reject"].includes(action)) {
    return NextResponse.json({ error: "参数无效" }, { status: 400 });
  }

  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: session.user.id,
      },
    },
    include: { team: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "未找到该邀请" }, { status: 404 });
  }

  if (membership.status !== "PENDING") {
    return NextResponse.json({ error: "该邀请已处理" }, { status: 409 });
  }

  const newStatus = action === "accept" ? "ACCEPTED" : "REJECTED";

  await prisma.teamMember.update({
    where: { id: membership.id },
    data: { status: newStatus },
  });

  // 如果接受，通知队长
  if (action === "accept") {
    await prisma.notification.create({
      data: {
        userId: membership.team.captainId,
        type: "TEAM_JOINED",
        title: "新成员加入",
        message: `${session.user.name || "有人"} 加入了「${membership.team.name}」`,
        relatedId: teamId,
      },
    });

    // 检查首次加入团队成就
    const acceptedCount = await prisma.teamMember.count({
      where: { userId: session.user.id, status: "ACCEPTED" },
    });
    if (acceptedCount === 1) {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievement: {
            userId: session.user.id,
            achievement: "TEAM_PLAYER",
          },
        },
        create: {
          userId: session.user.id,
          achievement: "TEAM_PLAYER",
        },
        update: {},
      });
    }
  }

  return NextResponse.json({ data: { status: newStatus } });
}
