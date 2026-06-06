import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRecordSchema } from "@/lib/validations";

// GET /api/records — 获取当前用户的个人纪录
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const records = await prisma.personalRecord.findMany({
    where: { userId: session.user.id },
    include: {
      exercise: {
        select: { id: true, name: true, category: true, muscleGroup: true },
      },
    },
    orderBy: [{ exercise: { muscleGroup: "asc" } }, { weight: "desc" }],
  });

  return NextResponse.json({ data: records });
}

// POST /api/records — 手动添加/更新个人纪录
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { exerciseId, weight, reps } = parsed.data;

  const record = await prisma.personalRecord.upsert({
    where: {
      userId_exerciseId: {
        userId: session.user.id,
        exerciseId,
      },
    },
    create: {
      userId: session.user.id,
      exerciseId,
      weight,
      reps,
    },
    update: {
      weight,
      reps,
      achievedAt: new Date(),
    },
    include: {
      exercise: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ data: record });
}
