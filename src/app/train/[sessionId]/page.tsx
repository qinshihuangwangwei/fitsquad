import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrainingSessionClient } from "./client";

export default async function TrainingSessionPage({
  params: paramsPromise,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { sessionId } = await paramsPromise;

  const workoutSession = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      sets: {
        include: {
          exercise: {
            select: { id: true, name: true, muscleGroup: true },
          },
        },
        orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
      },
      plan: {
        select: { id: true, name: true },
      },
      team: {
        select: { id: true, name: true },
      },
    },
  });

  if (!workoutSession) notFound();
  if (workoutSession.userId !== session.user.id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg text-surface-600">无权访问此训练</p>
      </div>
    );
  }

  // 提取动作列表（去重，保持顺序）
  const exerciseOrder: Array<{
    exerciseId: string;
    exerciseName: string;
    muscleGroup: string;
    planExerciseId: string | null;
    sets: number;
    targetReps: number;
    targetWeight: number;
    restTime: number;
    completedSets: number;
    sets_: Array<{
      setNumber: number;
      reps: number;
      weight: number;
      completed: boolean;
    }>;
  }> = [];

  const seen = new Set<string>();
  for (const s of workoutSession.sets) {
    if (!seen.has(s.exerciseId)) {
      seen.add(s.exerciseId);
      const allSetsForEx = workoutSession.sets.filter(
        (ws) => ws.exerciseId === s.exerciseId
      );
      exerciseOrder.push({
        exerciseId: s.exerciseId,
        exerciseName: s.exercise.name,
        muscleGroup: s.exercise.muscleGroup,
        planExerciseId: s.planExerciseId,
        sets: allSetsForEx.length,
        targetReps: s.reps,
        targetWeight: s.weight,
        restTime: 60,
        completedSets: allSetsForEx.filter((ws) => ws.completed).length,
        sets_: allSetsForEx.map((ws) => ({
          setNumber: ws.setNumber,
          reps: ws.reps,
          weight: ws.weight,
          completed: ws.completed,
        })),
      });
    }
  }

  return (
    <TrainingSessionClient
      sessionId={workoutSession.id}
      planName={workoutSession.plan?.name}
      teamName={workoutSession.team?.name}
      status={workoutSession.status}
      exercises={exerciseOrder}
    />
  );
}
