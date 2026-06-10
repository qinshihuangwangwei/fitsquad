"use client";

import { useState, useRef } from "react";
import { SetCounter } from "@/components/training/SetCounter";
import { FinishTrainingButton } from "@/components/training/FinishTrainingButton";
import { useTeamFeed } from "@/hooks/useRealtime";
import { ArrowLeft, Dumbbell, Flag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ExerciseGroup {
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
}

interface TrainingSessionClientProps {
  sessionId: string;
  planName?: string;
  teamName?: string;
  status: string;
  exercises: ExerciseGroup[];
}

export function TrainingSessionClient({
  sessionId,
  planName,
  teamName,
  status,
  exercises: initialExercises,
}: TrainingSessionClientProps) {
  const [exercises, setExercises] = useState(initialExercises);
  const [currentExIndex, setCurrentExIndex] = useState(() => {
    const idx = initialExercises.findIndex(
      (ex) => ex.completedSets < ex.sets
    );
    return idx === -1 ? 0 : idx;
  });
  const [currentSetNum, setCurrentSetNum] = useState(() => {
    const ex = initialExercises[currentExIndex];
    if (!ex) return 1;
    return ex.completedSets + 1;
  });
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [feedMessages, setFeedMessages] = useState<string[]>([]);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useTeamFeed(undefined, (data: any) => {
    setFeedMessages((prev) => [
      `队友完成了 ${data?.exercise?.name || "一组训练"}`,
      ...prev.slice(0, 4),
    ]);
  });

  const currentEx = exercises[currentExIndex];
  if (!currentEx) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-2xl border border-surface-200 bg-white p-8 text-center shadow-card">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto">
            <Flag className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-surface-900">
            训练完成！
          </h1>
          <p className="mt-2 text-surface-500">
            干得漂亮！所有动作都已完成。
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-base font-semibold text-white shadow-button hover:shadow-buttonHover transition-all"
          >
            返回主页
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  const handleCompleteSet = async (data: { reps: number; weight: number }) => {
    let res: Response;
    try {
      res = await fetch(`/api/sessions/${sessionId}/complete-set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: currentEx.exerciseId,
          planExerciseId: currentEx.planExerciseId,
          setNumber: currentSetNum,
          reps: data.reps,
          weight: data.weight,
          broadcast: true,
        }),
      });
    } catch {
      return;
    }

    let result: { data?: { sessionCompleted?: boolean } };
    try {
      result = await res.json();
    } catch {
      return;
    }

    if (res.ok) {
      setExercises((prev) =>
        prev.map((ex, i) => {
          if (i !== currentExIndex) return ex;
          return {
            ...ex,
            completedSets: ex.completedSets + 1,
            sets_: ex.sets_.map((s) =>
              s.setNumber === currentSetNum
                ? { ...s, completed: true, reps: data.reps, weight: data.weight }
                : s
            ),
          };
        })
      );

      setIsResting(true);
      setRestTimeLeft(currentEx.restTime);
      restIntervalRef.current = setInterval(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(restIntervalRef.current!);
            setIsResting(false);
            advanceToNextSet();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const advanceToNextSet = () => {
    setCurrentSetNum((prevSet) => {
      const ex = exercises[currentExIndex];
      if (!ex) return prevSet;
      if (prevSet < ex.sets) return prevSet + 1;
      setCurrentExIndex((prevIdx) => {
        if (prevIdx < exercises.length - 1) return prevIdx + 1;
        return prevIdx;
      });
      return 1;
    });
  };

  const handleSkipRest = () => {
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
    }
    setIsResting(false);
    advanceToNextSet();
  };

  const totalSets = exercises.reduce((s, ex) => s + ex.sets, 0);
  const completedTotalSets = exercises.reduce(
    (s, ex) => s + ex.completedSets,
    0
  );
  const overallProgress =
    totalSets > 0 ? (completedTotalSets / totalSets) * 100 : 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-surface-600 hover:text-surface-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden sm:inline">退出</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-surface-400">
          {planName && <span className="bg-surface-100 rounded-full px-2 py-1">{planName}</span>}
          {teamName && <span className="bg-brand-50 rounded-full px-2 py-1 text-brand-700">🏠 {teamName}</span>}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-surface-500 mb-2">
          <span>总进度</span>
          <span>
            {completedTotalSets}/{totalSets} 组
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {exercises.map((ex, i) => (
          <button
            key={ex.exerciseId}
            onClick={() => {
              setCurrentExIndex(i);
              setCurrentSetNum(ex.completedSets + 1);
              setIsResting(false);
            }}
            className={cn(
              "flex-shrink-0 rounded-xl px-4 py-2.5 text-xs font-medium transition-all duration-200",
              i === currentExIndex
                ? "bg-brand-600 text-white shadow-md"
                : ex.completedSets === ex.sets
                ? "bg-green-100 text-green-700"
                : ex.completedSets > 0
                ? "bg-brand-50 text-brand-700"
                : "bg-surface-100 text-surface-500"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="truncate max-w-[80px]">{ex.exerciseName}</span>
              <span className="opacity-75">({ex.completedSets}/{ex.sets})</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <SetCounter
          exerciseName={currentEx.exerciseName}
          currentSet={currentSetNum}
          totalSets={currentEx.sets}
          targetReps={currentEx.targetReps}
          targetWeight={currentEx.targetWeight}
          restTime={currentEx.restTime}
          onComplete={handleCompleteSet}
          onSkipRest={handleSkipRest}
          isResting={isResting}
          restTimeLeft={restTimeLeft}
          currentSetTargetWeight={
            currentEx.sets_.find((s) => s.setNumber === currentSetNum)?.weight
          }
          currentSetTargetReps={
            currentEx.sets_.find((s) => s.setNumber === currentSetNum)?.reps
          }
        />
      </div>

      <FinishTrainingButton
        sessionId={sessionId}
        allDone={completedTotalSets === totalSets}
        disabled={isResting}
      />

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-surface-700 mb-3">
          已完成组记录
        </h3>
        <div className="flex gap-2 flex-wrap">
          {currentEx.sets_.map((s) => (
            <div
              key={s.setNumber}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl text-sm font-semibold transition-all",
                s.completed
                  ? "bg-green-100 text-green-700"
                  : s.setNumber === currentSetNum
                  ? "bg-brand-100 text-brand-700 ring-2 ring-brand-400"
                  : "bg-surface-100 text-surface-400"
              )}
            >
              {s.completed ? (
                <span className="text-center">
                  <span className="block text-xs opacity-70">{s.weight}KG</span>
                  <span>{s.reps}次</span>
                </span>
              ) : (
                s.setNumber
              )}
            </div>
          ))}
        </div>
      </div>

      {feedMessages.length > 0 && (
        <div className="mt-6 rounded-xl border border-surface-200 bg-gradient-to-br from-surface-50 to-white p-4">
          <h3 className="text-xs font-semibold text-surface-500 mb-2 flex items-center gap-1">
            <Dumbbell className="h-3 w-3" />
            队友动态
          </h3>
          {feedMessages.map((msg, i) => (
            <p key={i} className="text-sm text-surface-600 py-1.5 border-b border-surface-100 last:border-0">
              {msg}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
