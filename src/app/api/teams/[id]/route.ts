import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/teams/[id] — 获取团队详情
export async function GET(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await paramsPromise;
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      captain: {
        select: { id: true, name: true, avatar: true },
      },
      members: {
        where: { status: "ACCEPTED" },
        include: {
          user: {
            select: { id: true, name: true, avatar: true, bodyWeight: true },
          },
        },
      },
      _count: { select: { members: { where: { status: "ACCEPTED" } } } },
      plans: {
        take: 5,
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!team) {
    return NextResponse.json({ error: "团队不存在" }, { status: 404 });
  }

  // 检查用户是否为成员
  const isMember = team.members.some((m) => m.userId === session.user.id);
  if (!isMember) {
    return NextResponse.json({ error: "你不是该团队的成员" }, { status: 403 });
  }

  return NextResponse.json({ data: team });
}

// PUT /api/teams/[id] — 更新团队信息（仅队长）
export async function PUT(
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
    return NextResponse.json({ error: "只有队长可以编辑团队信息" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.team.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      avatar: body.avatar,
    },
  });

  return NextResponse.json({ data: updated });
}

// DELETE /api/teams/[id] — 解散团队（仅队长）
export async function DELETE(
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
    return NextResponse.json({ error: "只有队长可以解散团队" }, { status: 403 });
  }

  await prisma.team.delete({ where: { id } });

  return NextResponse.json({ data: { success: true } });
}
