import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PlanBuilder } from "@/components/plans/PlanBuilder";

export default function NewPlanPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/plans"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700"
      >
        <ArrowLeft className="h-4 w-4" /> 返回
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-surface-900">创建训练计划</h1>
      <p className="mt-1 text-sm text-surface-500">
        自定义你的训练日、动作、组数和重量 (KG)
      </p>

      <div className="mt-8">
        <PlanBuilder />
      </div>
    </div>
  );
}
