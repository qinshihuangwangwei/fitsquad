import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Dumbbell, Users, Trophy, Zap } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-bold">
            F
          </div>
          <span className="text-xl font-bold text-surface-900">FitSquad</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            注册
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-surface-900 sm:text-5xl">
            组团健身
            <span className="block text-brand-600">一起变强</span>
          </h1>
          <p className="mt-6 text-lg text-surface-500 leading-relaxed">
            FitSquad 帮助你创建健身团队、制定训练计划、记录每一次突破，
            与队友一起冲击排行榜。所有重量统一使用 KG 单位。
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="rounded-xl bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-brand-700 transition-colors"
            >
              立即开始
            </Link>
            <Link
              href="/login"
              className="rounded-xl border-2 border-surface-300 px-8 py-4 text-base font-semibold text-surface-700 hover:border-brand-300 transition-colors"
            >
              已有账号？登录
            </Link>
          </div>
        </div>

        {/* 特性 */}
        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {[
            {
              icon: <Dumbbell className="h-6 w-6 text-brand-600" />,
              title: "训练计划",
              desc: "预设模板 + 自定义计划，KG 重量",
            },
            {
              icon: <Users className="h-6 w-6 text-brand-600" />,
              title: "团队协作",
              desc: "创建小队，邀请好友一起训练",
            },
            {
              icon: <Trophy className="h-6 w-6 text-brand-600" />,
              title: "排行榜",
              desc: "队内 PK，按重量或次数排名",
            },
            {
              icon: <Zap className="h-6 w-6 text-brand-600" />,
              title: "实时追踪",
              desc: "训练中实时更新，推送给队友",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-surface-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                {feature.icon}
              </div>
              <h3 className="mt-3 font-semibold text-surface-900">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm text-surface-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-surface-400">
        FitSquad — 健身打卡与社交应用 · 所有重量使用 KG
      </footer>
    </div>
  );
}
