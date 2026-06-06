import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/plans/[id] — 获取计划详情
export async function GET(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await paramsPromise;
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      days: {
        orderBy: { sortOrder: "asc" },
        include: {
          exercises: {
            orderBy: { sortOrder: "asc" },
            include: {
              exercise: {
                select: { id: true, name: true, category: true, muscleGroup: true, description: true },
              },
              planSets: {
                orderBy: { setNumber: "asc" },
              },
            },
          },
        },
      },
      team: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!plan) {
    return NextResponse.json({ error: "计划不存在" }, { status: 404 });
  }

  // 模板计划所有人可见
  if (!plan.isTemplate && plan.createdById !== session.user.id) {
    if (plan.teamId) {
      const membership = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: { teamId: plan.teamId, userId: session.user.id },
        },
      });
      if (!membership || membership.status !== "ACCEPTED") {
        return NextResponse.json({ error: "无权访问" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "无权访问" }, { status: 403 });
    }
  }

  return NextResponse.json({ data: plan });
}

// DELETE /api/plans/[id] — 删除计划
export async function DELETE(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await paramsPromise;
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) {
    return NextResponse.json({ error: "计划不存在" }, { status: 404 });
  }
  if (plan.createdById !== session.user.id) {
    return NextResponse.json({ error: "只能删除自己的计划" }, { status: 403 });
  }

  await prisma.plan.delete({ where: { id } });

  return NextResponse.json({ data: { success: true } });
}
