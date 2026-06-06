import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/notifications/[id]/read — 标记单条已读
export async function PUT(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await paramsPromise;

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== session.user.id) {
    return NextResponse.json({ error: "通知不存在" }, { status: 404 });
  }

  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return NextResponse.json({ data: { success: true } });
}
