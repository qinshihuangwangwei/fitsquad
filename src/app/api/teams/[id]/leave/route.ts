import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/teams/[id]/leave — 主动退出团队
export async function POST(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id: teamId } = await paramsPromise;

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: session.user.id } },
    include: { team: { select: { captainId: true, name: true } } },
  });

  if (!membership || membership.status !== "ACCEPTED") {
    return NextResponse.json({ error: "你不是该团队成员" }, { status: 403 });
  }

  // 队长不能退出，必须先转让或解散
  if (membership.team.captainId === session.user.id) {
    return NextResponse.json(
      { error: "队长不能直接退出，请先解散团队或转让队长" },
      { status: 400 }
    );
  }

  await prisma.teamMember.delete({
    where: { id: membership.id },
  });

  return NextResponse.json({ data: { success: true } });
}
