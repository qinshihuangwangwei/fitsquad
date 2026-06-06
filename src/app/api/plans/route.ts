import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPlanSchema } from "@/lib/validations";

// GET /api/plans — 获取计划列表
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const isTemplate = searchParams.get("template") === "true";
  const teamId = searchParams.get("teamId");

  const where: Record<string, unknown> = {};

  if (isTemplate) {
    where.isTemplate = true;
  } else if (teamId) {
    where.teamId = teamId;
  } else {
    where.createdById = session.user.id;
  }

  const plans = await prisma.plan.findMany({
    where,
    include: {
      days: {
        orderBy: { sortOrder: "asc" },
        include: {
          exercises: {
            orderBy: { sortOrder: "asc" },
            include: {
              exercise: {
                select: { id: true, name: true, category: true, muscleGroup: true },
              },
              planSets: { orderBy: { setNumber: "asc" } },
            },
          },
        },
      },
      team: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ data: plans });
}

// POST /api/plans — 创建计划
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { name, description, teamId, days } = parsed.data;

  // 如果指定了 teamId，验证用户是该团队成员
  if (teamId) {
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: { teamId, userId: session.user.id },
      },
    });
    if (!membership || membership.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "你不是该团队成员" },
        { status: 403 }
      );
    }
  }

  try {
    const plan = await prisma.plan.create({
    data: {
      name,
      description,
      createdById: session.user.id,
      teamId: teamId || null,
      days: {
        create: days.map((day) => ({
          dayName: day.dayName,
          sortOrder: day.sortOrder,
          exercises: {
            create: day.exercises.map((ex) => {
              // 如果传了 planSets，用它；否则用默认组数生成
              const setsData = ex.planSets && ex.planSets.length > 0
                ? ex.planSets
                : Array.from({ length: ex.sets }, (_, i) => ({
                    setNumber: i + 1,
                    targetReps: ex.reps,
                    targetWeight: ex.weight,
                  }));

              return {
                exerciseId: ex.exerciseId,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight,
                restTime: ex.restTime,
                notes: ex.notes,
                sortOrder: ex.sortOrder,
                planSets: {
                  create: setsData,
                },
              };
            }),
          },
        })),
      },
    },
    include: {
      days: {
        orderBy: { sortOrder: "asc" },
        include: {
          exercises: {
            orderBy: { sortOrder: "asc" },
            include: {
              exercise: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

    // 检查首次创建计划成就
    const planCount = await prisma.plan.count({
      where: { createdById: session.user.id },
    });
    if (planCount === 1) {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievement: {
            userId: session.user.id,
            achievement: "PLAN_CREATOR",
          },
        },
        create: { userId: session.user.id, achievement: "PLAN_CREATOR" },
        update: {},
      });
    }

    return NextResponse.json({ data: plan }, { status: 201 });
  } catch (err: any) {
    console.error("Plan creation error:", err);
    return NextResponse.json(
      { error: err?.message || "创建计划失败" },
      { status: 500 }
    );
  }
}
