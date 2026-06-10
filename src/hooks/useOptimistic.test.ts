import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOptimistic } from "./useOptimistic";

describe("useOptimistic", () => {
  it("should initialize with initial value", () => {
    const { result } = renderHook(() => useOptimistic(0));
    expect(result.current[0]).toBe(0);
    expect(result.current[2]).toBe(false);
  });

  it("should apply optimistic update immediately", () => {
    const { result } = renderHook(() => useOptimistic(0));
    const [, mutate] = result.current;

    act(() => {
      mutate(
        (current) => current + 1,
        (current) => current - 1,
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      );
    });

    expect(result.current[0]).toBe(1);
    expect(result.current[2]).toBe(true);
  });

  it("should rollback on server error", async () => {
    const { result } = renderHook(() => useOptimistic(10));
    const [, mutate] = result.current;

    act(() => {
      mutate(
        () => 15,
        () => 10,
        async () => {
          throw new Error("Server error");
        }
      );
    });

    expect(result.current[0]).toBe(15);
    expect(result.current[2]).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(result.current[0]).toBe(10);
    expect(result.current[2]).toBe(false);
  });

  it("should keep optimistic update on success", async () => {
    const { result } = renderHook(() => useOptimistic(10));
    const [, mutate] = result.current;

    act(() => {
      mutate(
        () => 15,
        () => 10,
        async () => {}
      );
    });

    expect(result.current[0]).toBe(15);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(result.current[0]).toBe(15);
    expect(result.current[2]).toBe(false);
  });
});
