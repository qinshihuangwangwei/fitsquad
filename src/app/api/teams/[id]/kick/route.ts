import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/teams/[id]/kick — 队长踢出成员
export async function POST(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id: teamId } = await paramsPromise;

  // 验证是队长
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    return NextResponse.json({ error: "团队不存在" }, { status: 404 });
  }
  if (team.captainId !== session.user.id) {
    return NextResponse.json({ error: "只有队长可以踢出成员" }, { status: 403 });
  }

  const body = await req.json();
  const { userId } = body as { userId: string };

  if (!userId) {
    return NextResponse.json({ error: "请指定要踢出的用户" }, { status: 400 });
  }

  // 不能踢自己
  if (userId === session.user.id) {
    return NextResponse.json({ error: "不能踢出自己" }, { status: 400 });
  }

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });

  if (!membership || membership.status !== "ACCEPTED") {
    return NextResponse.json({ error: "该用户不是团队成员" }, { status: 404 });
  }

  await prisma.teamMember.delete({
    where: { id: membership.id },
  });

  // 通知被踢出的用户
  await prisma.notification.create({
    data: {
      userId,
      type: "SYSTEM",
      title: "已被移出团队",
      message: `你已被移出「${team.name}」`,
      relatedId: teamId,
    },
  });

  return NextResponse.json({ data: { success: true } });
}
