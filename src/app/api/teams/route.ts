import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTeamSchema } from "@/lib/validations";

// GET /api/teams — 获取当前用户的所有团队
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const teams = await prisma.team.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
          status: "ACCEPTED",
        },
      },
    },
    include: {
      captain: {
        select: { id: true, name: true, avatar: true },
      },
      _count: {
        select: { members: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ data: teams });
}

// POST /api/teams — 创建新团队
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const team = await prisma.team.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      avatar: parsed.data.avatar,
      captainId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "CAPTAIN",
          status: "ACCEPTED",
        },
      },
    },
    include: {
      captain: {
        select: { id: true, name: true, avatar: true },
      },
      members: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      },
      _count: { select: { members: true } },
    },
  });

  return NextResponse.json({ data: team }, { status: 201 });
}
