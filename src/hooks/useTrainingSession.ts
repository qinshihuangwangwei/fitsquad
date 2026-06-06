"use client";

import { useState, useCallback } from "react";
import { SessionWithSets } from "@/types";

interface TrainingState {
  session: SessionWithSets | null;
  currentExerciseIndex: number;
  currentSetNumber: number;
  isResting: boolean;
  restTimeLeft: number;
}

export function useTrainingSession(initialSession?: SessionWithSets | null) {
  const [state, setState] = useState<TrainingState>({
    session: initialSession ?? null,
    currentExerciseIndex: 0,
    currentSetNumber: 1,
    isResting: false,
    restTimeLeft: 0,
  });

  const setSession = useCallback((session: SessionWithSets) => {
    setState((prev) => ({ ...prev, session }));
  }, []);

  const nextSet = useCallback(() => {
    setState((prev) => {
      if (!prev.session) return prev;
      const currentExercise = prev.session.sets.filter(
        (s) => s.exerciseId === prev.session?.sets[prev.currentExerciseIndex]?.exerciseId
      );
      const totalSets = currentExercise.length;

      if (prev.currentSetNumber < totalSets) {
        return { ...prev, currentSetNumber: prev.currentSetNumber + 1 };
      }
      // 移动到下一个动作
      if (prev.currentExerciseIndex < prev.session.sets.length - 1) {
        return {
          ...prev,
          currentExerciseIndex: prev.currentExerciseIndex + 1,
          currentSetNumber: 1,
        };
      }
      // 训练完成
      return prev;
    });
  }, []);

  const startRest = useCallback((restTime: number) => {
    setState((prev) => ({ ...prev, isResting: true, restTimeLeft: restTime }));
    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.restTimeLeft <= 1) {
          clearInterval(interval);
          return { ...prev, isResting: false, restTimeLeft: 0 };
        }
        return { ...prev, restTimeLeft: prev.restTimeLeft - 1 };
      });
    }, 1000);
  }, []);

  return {
    ...state,
    setSession,
    nextSet,
    startRest,
  };
}
