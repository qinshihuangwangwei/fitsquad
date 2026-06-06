import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startSessionSchema } from "@/lib/validations";

// POST /api/sessions/start — 开始训练
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = startSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { planId, teamId, exercises } = parsed.data;

  // 检查是否有活跃的训练
  const activeSession = await prisma.workoutSession.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
  });
  if (activeSession) {
    // 自动取消之前的活跃训练
    await prisma.workoutSession.update({
      where: { id: activeSession.id },
      data: { status: "CANCELLED", endedAt: new Date() },
    });
  }

  let allExercises: Array<{
    exerciseId: string;
    planExerciseId?: string;
    sets: number;
    reps: number;
    weight: number;
    restTime: number;
  }> = [];

  if (planId) {
    // 从计划加载（含 PlanSet）
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        days: {
          orderBy: { sortOrder: "asc" },
          include: {
            exercises: {
              orderBy: { sortOrder: "asc" },
              include: {
                planSets: { orderBy: { setNumber: "asc" } },
              },
            },
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "计划不存在" }, { status: 404 });
    }

    for (const day of plan.days) {
      for (const pe of day.exercises) {
        allExercises.push({
          exerciseId: pe.exerciseId,
          planExerciseId: pe.id,
          sets: pe.sets,
          reps: pe.reps,
          weight: pe.weight,
          restTime: pe.restTime,
          // 传递 PlanSet 数据用于逐组创建
          _planSets: pe.planSets,
        } as any);
      }
    }
  } else if (exercises) {
    // 自由训练
    allExercises = exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      planExerciseId: ex.planExerciseId,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      restTime: 60,
    }));
  } else {
    return NextResponse.json({ error: "请选择训练计划或指定动作" }, { status: 400 });
  }

  // 创建训练会话
  const workoutSession = await prisma.workoutSession.create({
    data: {
      userId: session.user.id,
      planId: planId || null,
      teamId: teamId || null,
      status: "ACTIVE",
      sets: {
        create: allExercises.flatMap((ex: any) => {
          const planSets: any[] = ex._planSets || [];
          return Array.from({ length: ex.sets }, (_, setIdx) => {
            const ps = planSets.find((p: any) => p.setNumber === setIdx + 1);
            return {
              exerciseId: ex.exerciseId,
              planExerciseId: ex.planExerciseId,
              planSetId: ps?.id || null,
              setNumber: setIdx + 1,
              reps: ps?.targetReps ?? ex.reps,
              weight: ps?.targetWeight ?? ex.weight,
              completed: false,
            };
          });
        }),
      },
    },
    include: {
      sets: {
        include: {
          exercise: { select: { id: true, name: true, muscleGroup: true } },
        },
        orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
      },
      plan: { select: { id: true, name: true } },
      team: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ data: workoutSession }, { status: 201 });
}
