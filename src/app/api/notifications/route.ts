import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications — 获取通知（支持分页和类型筛选）
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
  const type = searchParams.get("type") || ""; // TEAM_INVITE | SYSTEM | "" = 全部
  const unreadOnly = searchParams.get("unread") === "true";

  const where: Record<string, unknown> = { userId: session.user.id };
  if (unreadOnly) where.read = false;
  if (type && ["TEAM_INVITE", "TEAM_JOINED", "RECORD_BROKEN", "WORKOUT_COMPLETED", "ACHIEVEMENT", "SYSTEM"].includes(type)) {
    where.type = type;
  }

  const [notifications, totalCount, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: [{ read: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: session.user.id, read: false } }),
  ]);

  return NextResponse.json({
    data: notifications,
    unreadCount,
    totalCount,
    page,
    limit,
    hasMore: page * limit < totalCount,
  });
}

// PUT /api/notifications — 标记所有通知为已读
export async function PUT() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  return NextResponse.json({ data: { success: true } });
}
