import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { completeSetSchema } from "@/lib/validations";

// POST /api/sessions/[id]/complete-set — 完成一组训练
export async function POST(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id: sessionId } = await paramsPromise;

  const body = await req.json();
  const parsed = completeSetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { exerciseId, setNumber, reps, weight, notes, broadcast } = parsed.data;

  // 验证会话归属
  const workoutSession = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: { team: { select: { id: true } } },
  });

  if (!workoutSession) {
    return NextResponse.json({ error: "训练会话不存在" }, { status: 404 });
  }
  if (workoutSession.userId !== session.user.id) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }
  if (workoutSession.status !== "ACTIVE") {
    return NextResponse.json({ error: "训练已结束" }, { status: 400 });
  }

  // 查找对应的 WorkoutSet
  const targetSet = await prisma.workoutSet.findFirst({
    where: {
      sessionId,
      exerciseId,
      setNumber,
      completed: false,
    },
  });

  if (!targetSet) {
    return NextResponse.json(
      { error: "未找到该组训练或该组已完成" },
      { status: 404 }
    );
  }

  // 更新该组
  const updatedSet = await prisma.workoutSet.update({
    where: { id: targetSet.id },
    data: {
      reps,
      weight,
      notes: notes || null,
      completed: true,
      completedAt: new Date(),
    },
    include: {
      exercise: { select: { id: true, name: true } },
    },
  });

  // 检查是否创下个人纪录
  const existingRecord = await prisma.personalRecord.findUnique({
    where: {
      userId_exerciseId: {
        userId: session.user.id,
        exerciseId,
      },
    },
  });

  const isNewRecord =
    !existingRecord ||
    weight > existingRecord.weight ||
    (weight === existingRecord.weight && reps > existingRecord.reps);

  if (isNewRecord) {
    await prisma.personalRecord.upsert({
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
        achievedAt: new Date(),
      },
      update: {
        weight: weight > (existingRecord?.weight || 0) ? weight : existingRecord!.weight,
        reps: reps > (existingRecord?.reps || 0) ? reps : existingRecord!.reps,
        achievedAt: new Date(),
      },
    });

    // 检查首次纪录成就
    const recordCount = await prisma.personalRecord.count({
      where: { userId: session.user.id },
    });
    if (recordCount === 1) {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievement: {
            userId: session.user.id,
            achievement: "FIRST_RECORD",
          },
        },
        create: {
          userId: session.user.id,
          achievement: "FIRST_RECORD",
        },
        update: {},
      });
    }

    // 通知用户个人纪录
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "RECORD_BROKEN",
        title: "🎉 新纪录！",
        message: `${updatedSet.exercise.name} 新纪录: ${weight} KG × ${reps} 次`,
        relatedId: exerciseId,
      },
    });
  }

  // 计算当前已完成的组数（仅用于返回前端进度展示）
  const completedSets = await prisma.workoutSet.count({
    where: { sessionId, completed: true },
  });
  const totalSets = await prisma.workoutSet.count({
    where: { sessionId },
  });

  // 注意：不在此处结束 session！由前端调用 /api/sessions/[id]/finish 显式结束

  return NextResponse.json({
    data: {
      set: updatedSet,
      isNewRecord,
      completedSets,
      totalSets,
      allDone: completedSets === totalSets,
    },
  });
}
