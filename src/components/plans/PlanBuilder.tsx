"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, X, ChevronDown, ChevronRight } from "lucide-react";

interface ExerciseRef {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
}

interface PlanSetData {
  setNumber: number;
  targetReps: number;
  targetWeight: number;
}

interface PlanExerciseData {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
  notes?: string;
  sortOrder: number;
  planSets?: PlanSetData[];
}

interface PlanDayData {
  dayName: string;
  sortOrder: number;
  exercises: PlanExerciseData[];
}

export function PlanBuilder() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState<PlanDayData[]>([
    { dayName: "训练日 1", sortOrder: 0, exercises: [] },
  ]);
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // 记录哪些动作展开了逐组编辑
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/exercises")
      .then((r) => r.json())
      .then((data) => setExerciseLibrary(data.data || []))
      .catch(() => {});
  }, []);

  const addDay = () => {
    setDays((prev) => [
      ...prev,
      { dayName: `训练日 ${prev.length + 1}`, sortOrder: prev.length, exercises: [] },
    ]);
  };

  const removeDay = (dayIndex: number) => {
    setDays((prev) => prev.filter((_, i) => i !== dayIndex));
  };

  const updateDayName = (dayIndex: number, value: string) => {
    setDays((prev) =>
      prev.map((d, i) => (i === dayIndex ? { ...d, dayName: value } : d))
    );
  };

  const addExercise = (dayIndex: number, exerciseId: string) => {
    const ex = exerciseLibrary.find((e) => e.id === exerciseId);
    if (!ex) return;
    const key = `${dayIndex}-${Date.now()}`;
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIndex) return d;
        return {
          ...d,
          exercises: [
            ...d.exercises,
            {
              exerciseId: ex.id,
              sets: 3,
              reps: 10,
              weight: 20,
              restTime: 60,
              sortOrder: d.exercises.length,
              planSets: [
                { setNumber: 1, targetReps: 10, targetWeight: 20 },
                { setNumber: 2, targetReps: 10, targetWeight: 20 },
                { setNumber: 3, targetReps: 10, targetWeight: 20 },
              ],
            },
          ],
        };
      })
    );
    setExpandedExercises((prev) => new Set(prev).add(key));
  };

  const removeExercise = (dayIndex: number, exIndex: number) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIndex) return d;
        return { ...d, exercises: d.exercises.filter((_, j) => j !== exIndex) };
      })
    );
  };

  const updateExercise = (
    dayIndex: number,
    exIndex: number,
    field: keyof PlanExerciseData,
    value: number | string
  ) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIndex) return d;
        return {
          ...d,
          exercises: d.exercises.map((e, j) => {
            if (j !== exIndex) return e;
            const updated = { ...e, [field]: value };

            // 如果修改了总组数，自动调整 planSets 数量
            if (field === "sets" && typeof value === "number") {
              const newSets = value;
              const currentPlanSets = updated.planSets || [];
              if (newSets > currentPlanSets.length) {
                const lastSet = currentPlanSets[currentPlanSets.length - 1] || { targetReps: updated.reps, targetWeight: updated.weight };
                for (let s = currentPlanSets.length + 1; s <= newSets; s++) {
                  currentPlanSets.push({ setNumber: s, targetReps: lastSet.targetReps, targetWeight: lastSet.targetWeight });
                }
              } else {
                updated.planSets = currentPlanSets.slice(0, newSets);
              }
            }

            // 如果修改了默认 reps/weight，同步更新所有 planSets
            if ((field === "reps" || field === "weight") && typeof value === "number") {
              const ps = updated.planSets || [];
              for (const s of ps) {
                if (field === "reps") s.targetReps = value;
                else s.targetWeight = value;
              }
            }

            return updated;
          }),
        };
      })
    );
  };

  const updatePlanSet = (
    dayIndex: number,
    exIndex: number,
    setIndex: number,
    field: "targetReps" | "targetWeight",
    value: number
  ) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIndex) return d;
        return {
          ...d,
          exercises: d.exercises.map((e, j) => {
            if (j !== exIndex) return e;
            const planSets = [...(e.planSets || [])];
            if (planSets[setIndex]) {
              planSets[setIndex] = { ...planSets[setIndex], [field]: value };
            }
            return { ...e, planSets };
          }),
        };
      })
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("请输入计划名称");
      return;
    }
    setLoading(true);
    setError("");

    // 清洗数据：确保所有数字字段有效，过滤空 planSets
    const cleanDays = days.map((day) => ({
      dayName: day.dayName,
      sortOrder: day.sortOrder,
      exercises: day.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: Number(ex.sets) || 3,
        reps: Number(ex.reps) || 10,
        weight: Number(ex.weight) || 20,
        restTime: Number(ex.restTime) || 60,
        notes: ex.notes || undefined,
        sortOrder: ex.sortOrder,
        planSets: (ex.planSets?.length || 0) > 0
          ? ex.planSets!.map((ps) => ({
              setNumber: Number(ps.setNumber),
              targetReps: Number(ps.targetReps) || 10,
              targetWeight: Number(ps.targetWeight) || 20,
            }))
          : undefined,
      })),
    }));

    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, days: cleanDays }),
    });

    let data: { error?: string; data?: { id: string } };
    try {
      data = await res.json();
    } catch {
      setError("服务器错误，请重试");
      setLoading(false);
      return;
    }

    if (!res.ok) {
      setError(data.error || "创建失败");
    } else {
      router.push(`/plans/${data.data!.id}`);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="计划名称"
          className="w-full rounded-lg border border-surface-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="计划描述（可选）"
          rows={2}
          className="w-full rounded-lg border border-surface-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none resize-none"
        />
      </div>

      {/* 训练日列表 */}
      {days.map((day, dayIndex) => (
        <div key={dayIndex} className="rounded-xl border border-surface-200 bg-surface-50 p-4">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-surface-300" />
            <input
              type="text"
              value={day.dayName}
              onChange={(e) => updateDayName(dayIndex, e.target.value)}
              placeholder="训练日名称"
              className="flex-1 rounded-lg border border-surface-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-500"
            />
            {days.length > 1 && (
              <button onClick={() => removeDay(dayIndex)} className="p-1 text-surface-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* 动作列表 */}
          <div className="mt-3 space-y-2">
            {day.exercises.map((ex, exIndex) => {
              const exInfo = exerciseLibrary.find((e) => e.id === ex.exerciseId);
              const expandKey = `${dayIndex}-${exIndex}`;
              const isExpanded = expandedExercises.has(expandKey);

              return (
                <div key={exIndex} className="rounded-lg bg-white border border-surface-100 overflow-hidden">
                  {/* 动作头部 — 折叠行 */}
                  <div className="flex flex-wrap items-center gap-2 p-3 text-xs">
                    <span className="w-20 font-medium text-surface-900 truncate">
                      {exInfo?.name || "未知动作"}
                    </span>
                    <label className="flex items-center gap-1">
                      组
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={(e) => updateExercise(dayIndex, exIndex, "sets", Number(e.target.value))}
                        className="w-12 rounded border border-surface-200 px-1 py-0.5 text-center"
                        min={1} max={20}
                      />
                    </label>
                    <label className="flex items-center gap-1">
                      次
                      <input
                        type="number"
                        value={ex.reps}
                        onChange={(e) => updateExercise(dayIndex, exIndex, "reps", Number(e.target.value))}
                        className="w-12 rounded border border-surface-200 px-1 py-0.5 text-center"
                        min={1}
                      />
                    </label>
                    <label className="flex items-center gap-1">
                      KG
                      <input
                        type="number"
                        value={ex.weight}
                        onChange={(e) => updateExercise(dayIndex, exIndex, "weight", Number(e.target.value))}
                        className="w-14 rounded border border-surface-200 px-1 py-0.5 text-center"
                        min={0} step={0.5}
                      />
                    </label>
                    <label className="flex items-center gap-1">
                      休息s
                      <input
                        type="number"
                        value={ex.restTime}
                        onChange={(e) => updateExercise(dayIndex, exIndex, "restTime", Number(e.target.value))}
                        className="w-14 rounded border border-surface-200 px-1 py-0.5 text-center"
                        min={0}
                      />
                    </label>
                    <button
                      onClick={() => {
                        setExpandedExercises((prev) => {
                          const next = new Set(prev);
                          if (next.has(expandKey)) next.delete(expandKey);
                          else next.add(expandKey);
                          return next;
                        });
                      }}
                      className="ml-auto flex items-center gap-1 text-surface-400 hover:text-brand-600 transition-colors"
                      title="逐组编辑重量"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <button onClick={() => removeExercise(dayIndex, exIndex)} className="p-1 text-surface-400 hover:text-red-500">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* 展开：逐组重量编辑 */}
                  {isExpanded && ex.planSets && (
                    <div className="border-t border-surface-100 bg-surface-50 px-3 py-2">
                      <p className="text-[11px] text-surface-400 mb-2">逐组目标 (可分别设置每组重量和次数)</p>
                      <div className="space-y-1.5">
                        {ex.planSets.map((ps, psIdx) => (
                          <div key={psIdx} className="flex items-center gap-2 text-xs">
                            <span className="w-8 text-surface-400 font-mono">#{ps.setNumber}</span>
                            <label className="flex items-center gap-1">
                              次
                              <input
                                type="number"
                                value={ps.targetReps}
                                onChange={(e) => updatePlanSet(dayIndex, exIndex, psIdx, "targetReps", Number(e.target.value))}
                                className="w-12 rounded border border-surface-200 px-1 py-0.5 text-center bg-white"
                                min={1}
                              />
                            </label>
                            <label className="flex items-center gap-1">
                              KG
                              <input
                                type="number"
                                value={ps.targetWeight}
                                onChange={(e) => updatePlanSet(dayIndex, exIndex, psIdx, "targetWeight", Number(e.target.value))}
                                className="w-16 rounded border border-surface-200 px-1 py-0.5 text-center bg-white"
                                min={0} step={0.5}
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 添加动作下拉 */}
          <div className="mt-3">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addExercise(dayIndex, e.target.value);
                  e.target.value = "";
                }
              }}
              className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-xs text-surface-600 outline-none focus:border-brand-500"
            >
              <option value="">+ 添加动作</option>
              {exerciseLibrary.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.muscleGroup})
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <button
        onClick={addDay}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-surface-200 py-3 text-sm text-surface-500 hover:border-brand-300 hover:text-brand-600 transition-colors"
      >
        <Plus className="h-4 w-4" /> 添加训练日
      </button>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? "保存中..." : "保存计划"}
      </button>
    </div>
  );
}
