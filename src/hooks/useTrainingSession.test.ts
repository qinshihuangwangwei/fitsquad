import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTrainingSession } from "./useTrainingSession";
import { SessionWithSets } from "@/types";

const mockSession: SessionWithSets = {
  id: "session1",
  userId: "user1",
  planId: "plan1",
  teamId: null,
  status: "ACTIVE",
  createdAt: new Date(),
  startedAt: new Date(),
  endedAt: null,
  sets: [
    { id: "set1", exerciseId: "ex1", setNumber: 1, reps: 10, weight: 20, completed: false },
    { id: "set2", exerciseId: "ex1", setNumber: 2, reps: 10, weight: 20, completed: false },
    { id: "set3", exerciseId: "ex2", setNumber: 1, reps: 15, weight: 15, completed: false },
    { id: "set4", exerciseId: "ex2", setNumber: 2, reps: 15, weight: 15, completed: false },
  ],
};

describe("useTrainingSession", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useTrainingSession());
    expect(result.current.session).toBe(null);
    expect(result.current.currentExerciseIndex).toBe(0);
    expect(result.current.currentSetNumber).toBe(1);
    expect(result.current.isResting).toBe(false);
    expect(result.current.restTimeLeft).toBe(0);
  });

  it("should initialize with provided session", () => {
    const { result } = renderHook(() => useTrainingSession(mockSession));
    expect(result.current.session?.id).toBe("session1");
    expect(result.current.currentExerciseIndex).toBe(0);
    expect(result.current.currentSetNumber).toBe(1);
  });

  it("should set session", () => {
    const { result } = renderHook(() => useTrainingSession());
    act(() => {
      result.current.setSession(mockSession);
    });
    expect(result.current.session?.id).toBe("session1");
  });

  it("should advance to next set within same exercise", () => {
    const { result } = renderHook(() => useTrainingSession(mockSession));
    act(() => {
      result.current.nextSet();
    });
    expect(result.current.currentSetNumber).toBe(2);
    expect(result.current.currentExerciseIndex).toBe(0);
  });

  it("should advance to next exercise when current exercise is complete", () => {
    const { result } = renderHook(() => useTrainingSession(mockSession));
    act(() => {
      result.current.nextSet();
      result.current.nextSet();
    });
    expect(result.current.currentSetNumber).toBe(1);
    expect(result.current.currentExerciseIndex).toBe(2);
  });

  it("should not advance beyond last exercise", () => {
    const { result } = renderHook(() => useTrainingSession(mockSession));
    act(() => {
      result.current.nextSet();
      result.current.nextSet();
      result.current.nextSet();
      result.current.nextSet();
    });
    expect(result.current.currentSetNumber).toBe(2);
    expect(result.current.currentExerciseIndex).toBe(2);
  });

  it("should start resting with correct time", () => {
    const { result } = renderHook(() => useTrainingSession(mockSession));
    act(() => {
      result.current.startRest(60);
    });
    expect(result.current.isResting).toBe(true);
    expect(result.current.restTimeLeft).toBe(60);
  });

  it("should decrement rest time", () => {
    const { result } = renderHook(() => useTrainingSession(mockSession));
    act(() => {
      result.current.startRest(5);
    });
    expect(result.current.restTimeLeft).toBe(5);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.restTimeLeft).toBe(4);
  });

  it("should stop resting when time reaches zero", () => {
    const { result } = renderHook(() => useTrainingSession(mockSession));
    act(() => {
      result.current.startRest(2);
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.isResting).toBe(false);
    expect(result.current.restTimeLeft).toBe(0);
  });
});
