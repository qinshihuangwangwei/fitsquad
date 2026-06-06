import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inviteMemberSchema } from "@/lib/validations";

// POST /api/teams/[id]/invite — 邀请用户加入团队（仅队长）
export async function POST(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await paramsPromise;
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) {
    return NextResponse.json({ error: "团队不存在" }, { status: 404 });
  }
  if (team.captainId !== session.user.id) {
    return NextResponse.json({ error: "只有队长可以邀请成员" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = inviteMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  // 检查被邀请用户是否存在
  const targetUser = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
  });
  if (!targetUser) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  // 检查是否已是成员
  const existingMembership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId: id,
        userId: parsed.data.userId,
      },
    },
  });

  if (existingMembership) {
    if (existingMembership.status === "ACCEPTED") {
      return NextResponse.json({ error: "该用户已是团队成员" }, { status: 409 });
    }
    if (existingMembership.status === "PENDING") {
      return NextResponse.json({ error: "已向该用户发送过邀请" }, { status: 409 });
    }
    // 如果之前被拒绝，更新为 PENDING
    await prisma.teamMember.update({
      where: { id: existingMembership.id },
      data: { status: "PENDING" },
    });
  } else {
    // 创建新邀请
    await prisma.teamMember.create({
      data: {
        teamId: id,
        userId: parsed.data.userId,
        role: "MEMBER",
        status: "PENDING",
      },
    });
  }

  // 发送通知
  await prisma.notification.create({
    data: {
      userId: parsed.data.userId,
      type: "TEAM_INVITE",
      title: "团队邀请",
      message: `${session.user.name || "有人"} 邀请你加入「${team.name}」`,
      relatedId: id,
    },
  });

  return NextResponse.json({ data: { success: true } });
}
