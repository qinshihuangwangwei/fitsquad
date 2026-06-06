"use client";

import { useState, useRef } from "react";
import { SetCounter } from "@/components/training/SetCounter";
import { FinishTrainingButton } from "@/components/training/FinishTrainingButton";
import { useTeamFeed } from "@/hooks/useRealtime";
import { ArrowLeft, Dumbbell, Flag } from "lucide-react";
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
    // 找到第一个未完成的动作
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

  // 实时订阅团队动态
  useTeamFeed(undefined, (data: any) => {
    setFeedMessages((prev) => [
      `队友完成了 ${data?.exercise?.name || "一组训练"}`,
      ...prev.slice(0, 4),
    ]);
  });

  const currentEx = exercises[currentExIndex];
  if (!currentEx) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Flag className="mx-auto h-12 w-12 text-brand-500" />
        <h1 className="mt-4 text-2xl font-bold text-surface-900">
          训练完成！
        </h1>
        <p className="mt-2 text-surface-500">
          干得漂亮！所有动作都已完成。
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white"
        >
          返回主页
        </Link>
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
      return; // 网络错误，静默处理
    }

    let result: { data?: { sessionCompleted?: boolean } };
    try {
      result = await res.json();
    } catch {
      return; // 非 JSON 响应（如 proxy 重定向），静默处理
    }

    if (res.ok) {
      // 乐观更新本地状态
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

      // 启动休息计时器
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

  // 总进度
  const totalSets = exercises.reduce((s, ex) => s + ex.sets, 0);
  const completedTotalSets = exercises.reduce(
    (s, ex) => s + ex.completedSets,
    0
  );
  const overallProgress =
    totalSets > 0 ? (completedTotalSets / totalSets) * 100 : 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700"
        >
          <ArrowLeft className="h-4 w-4" /> 退出
        </Link>
        <div className="text-xs text-surface-400">
          {planName && <span>{planName}</span>}
          {teamName && <span className="ml-2">🏠 {teamName}</span>}
        </div>
      </div>

      {/* 总进度条 */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-surface-500 mb-1">
          <span>总进度</span>
          <span>
            {completedTotalSets}/{totalSets} 组
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* 动作列表横向滚动 */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {exercises.map((ex, i) => (
          <button
            key={ex.exerciseId}
            onClick={() => {
              setCurrentExIndex(i);
              setCurrentSetNum(ex.completedSets + 1);
              setIsResting(false);
            }}
            className={cn(
              "flex-shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              i === currentExIndex
                ? "bg-brand-600 text-white"
                : ex.completedSets === ex.sets
                ? "bg-green-100 text-green-700"
                : ex.completedSets > 0
                ? "bg-brand-50 text-brand-700"
                : "bg-surface-100 text-surface-500"
            )}
          >
            {ex.exerciseName} ({ex.completedSets}/{ex.sets})
          </button>
        ))}
      </div>

      {/* 核心区域 — SetCounter */}
      <div className="mt-8">
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

      {/* 结束训练按钮 */}
      <FinishTrainingButton
        sessionId={sessionId}
        allDone={completedTotalSets === totalSets}
        disabled={isResting}
      />

      {/* 当前动作的已完成组 */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-surface-700 mb-3">
          已完成组记录
        </h3>
        <div className="flex gap-2 flex-wrap">
          {currentEx.sets_.map((s) => (
            <div
              key={s.setNumber}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg text-xs font-medium",
                s.completed
                  ? "bg-green-100 text-green-700"
                  : s.setNumber === currentSetNum
                  ? "bg-brand-100 text-brand-700 ring-2 ring-brand-300"
                  : "bg-surface-100 text-surface-400"
              )}
            >
              {s.setNumber}
            </div>
          ))}
        </div>
      </div>

      {/* 团队动态 */}
      {feedMessages.length > 0 && (
        <div className="mt-6 rounded-xl border border-surface-200 bg-surface-50 p-4">
          <h3 className="text-xs font-medium text-surface-500 mb-2">
            队友动态
          </h3>
          {feedMessages.map((msg, i) => (
            <p key={i} className="text-xs text-surface-600">
              {msg}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
