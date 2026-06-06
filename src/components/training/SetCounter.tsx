"use client";

import { useState, useEffect, useRef } from "react";
import { cn, formatWeight } from "@/lib/utils";
import { Check, Timer } from "lucide-react";

interface SetCounterProps {
  exerciseName: string;
  currentSet: number;
  totalSets: number;
  targetReps: number;
  targetWeight: number;
  restTime: number;
  onComplete: (data: { reps: number; weight: number }) => Promise<void>;
  onSkipRest?: () => void;
  isResting: boolean;
  restTimeLeft: number;
  /** 当前组预设目标（来自 PlanSet），展示用 */
  currentSetTargetWeight?: number;
  currentSetTargetReps?: number;
}

export function SetCounter({
  exerciseName,
  currentSet,
  totalSets,
  targetReps,
  targetWeight,
  restTime,
  onComplete,
  onSkipRest,
  isResting,
  restTimeLeft,
  currentSetTargetWeight,
  currentSetTargetReps,
}: SetCounterProps) {
  const [reps, setReps] = useState(targetReps);
  const [weight, setWeight] = useState(targetWeight);
  const [completing, setCompleting] = useState(false);
  const [done, setDone] = useState(false);
  // 防连点：用 ref 记录最近一次点击时间
  const lastClickTime = useRef(0);
  const DISABLE_MS = 1500; // 1.5 秒内禁止重复点击

  useEffect(() => {
    setReps(targetReps);
    setWeight(targetWeight);
    setDone(false);
  }, [currentSet, targetReps, targetWeight]);

  const progress = ((currentSet - 1) / totalSets) * 100;

  const handleComplete = async () => {
    // 防连点：1.5 秒内禁止重复点击
    const now = Date.now();
    if (now - lastClickTime.current < DISABLE_MS) return;
    if (completing || done) return;
    lastClickTime.current = now;

    setCompleting(true);
    try {
      await onComplete({ reps, weight });
    } catch {
      // API 失败时不阻止重试，但确保状态重置
    }
    setCompleting(false);
    setDone(true);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 圆形进度条 */}
      <div className="relative flex items-center justify-center">
        <svg className="h-44 w-44 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-surface-100"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            className="text-brand-500 transition-all duration-700"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          {isResting ? (
            <>
              <Timer className="h-6 w-6 text-amber-500 animate-pulse" />
              <span className="mt-1 text-2xl font-bold text-amber-600">
                {restTimeLeft}
              </span>
              <span className="text-xs text-surface-400">秒休息</span>
            </>
          ) : done ? (
            <>
              <Check className="h-8 w-8 text-green-500" />
              <span className="mt-1 text-sm font-medium text-green-600">
                完成
              </span>
            </>
          ) : (
            <>
              <span className="text-3xl font-bold text-surface-900">
                {currentSet}
              </span>
              <span className="text-xs text-surface-400">
                / {totalSets} 组
              </span>
            </>
          )}
        </div>
      </div>

      {/* 动作名称 */}
      <h2 className="text-xl font-bold text-surface-900 text-center">
        {exerciseName}
      </h2>

      {/* 当前组预设目标（来自计划） */}
      {!isResting && !done && (currentSetTargetWeight != null || currentSetTargetReps != null) && (
        <div className="flex items-center gap-4 rounded-lg bg-surface-100 px-4 py-2 text-xs">
          <span className="text-surface-500">
            本组目标:
          </span>
          {currentSetTargetWeight != null && (
            <span className="font-semibold text-brand-600">
              {formatWeight(currentSetTargetWeight)}
            </span>
          )}
          {currentSetTargetReps != null && (
            <span className="font-semibold text-surface-700">
              {currentSetTargetReps} 次
            </span>
          )}
        </div>
      )}

      {/* 调整区 */}
      {!isResting && !done && (
        <div className="flex items-center gap-6">
          <div className="text-center">
            <label className="block text-xs text-surface-400 mb-1">次数</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setReps(Math.max(0, reps - 1))}
                className="h-8 w-8 rounded-lg bg-surface-100 text-surface-600 hover:bg-surface-200"
              >
                −
              </button>
              <span className="w-10 text-center text-lg font-semibold">
                {reps}
              </span>
              <button
                onClick={() => setReps(Math.min(100, reps + 1))}
                className="h-8 w-8 rounded-lg bg-surface-100 text-surface-600 hover:bg-surface-200"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-center">
            <label className="block text-xs text-surface-400 mb-1">重量</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setWeight(Math.max(0, +(weight - 2.5).toFixed(1)))}
                className="h-8 w-8 rounded-lg bg-surface-100 text-surface-600 hover:bg-surface-200"
              >
                −
              </button>
              <span className="w-16 text-center text-lg font-semibold text-brand-600">
                {formatWeight(weight)}
              </span>
              <button
                onClick={() => setWeight(Math.min(999, +(weight + 2.5).toFixed(1)))}
                className="h-8 w-8 rounded-lg bg-surface-100 text-surface-600 hover:bg-surface-200"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 完成按钮 */}
      {!isResting && !done && (
        <button
          onClick={handleComplete}
          disabled={completing}
          className={cn(
            "flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold text-white shadow-lg transition-all",
            "bg-brand-600 hover:bg-brand-700 hover:shadow-xl active:scale-95",
            "disabled:opacity-50"
          )}
        >
          <Check className="h-6 w-6" />
          {completing ? "记录中..." : "完成本组"}
        </button>
      )}

      {/* 休息计时器提示 */}
      {isResting && (
        <div className="text-center">
          <p className="text-sm text-surface-500">
            休息 {restTime} 秒...
          </p>
          <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-surface-100">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(restTimeLeft / restTime) * 100}%` }}
            />
          </div>
          <button
            onClick={() => onSkipRest?.()}
            className="mt-3 rounded-full border border-surface-300 px-5 py-1.5 text-xs font-medium text-surface-500 hover:bg-surface-100 active:scale-95 transition-all"
          >
            跳过休息
          </button>
        </div>
      )}

      {/* 完成提示 */}
      {done && currentSet < totalSets && (
        <p className="text-sm text-surface-500">准备下一组...</p>
      )}
      {done && currentSet === totalSets && (
        <p className="text-sm font-medium text-green-600">
          🎉 该动作全部完成！
        </p>
      )}
    </div>
  );
}
