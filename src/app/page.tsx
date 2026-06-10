import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Dumbbell, Users, Trophy, Zap, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-surface-50/80 backdrop-blur-lg border-b border-surface-200/50">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold shadow-lg shadow-brand-500/25">
            <Dumbbell className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-surface-900">FitSquad</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100 transition-all duration-200"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-button hover:shadow-buttonHover transition-all duration-300"
          >
            注册
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand-100 opacity-50 blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent-orange-100 opacity-40 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        </div>

        <div className="relative max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700 mb-6 animate-slide-down">
            <Zap className="h-4 w-4" />
            全新版本上线
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight text-surface-900 sm:text-6xl lg:text-7xl animate-slide-up">
            组团健身
            <span className="block bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 bg-clip-text text-transparent">
              一起变强
            </span>
          </h1>
          
          <p className="mt-8 text-lg text-surface-500 leading-relaxed max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
            FitSquad 帮助你创建健身团队、制定训练计划、记录每一次突破，
            与队友一起冲击排行榜。所有重量统一使用 KG 单位。
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link
              href="/register"
              className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-4 text-base font-semibold text-white shadow-button hover:shadow-buttonHover hover:scale-105 transition-all duration-300"
            >
              立即开始
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-surface-200 bg-white px-8 py-4 text-base font-semibold text-surface-700 hover:border-brand-300 hover:text-brand-700 hover:shadow-card transition-all duration-300"
            >
              已有账号？登录
            </Link>
          </div>
        </div>

        <div className="relative mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto w-full animate-slide-up" style={{ animationDelay: "0.3s" }}>
          {[
            {
              icon: <Dumbbell className="h-7 w-7 text-brand-600" />,
              title: "训练计划",
              desc: "预设模板 + 自定义计划，KG 重量",
              color: "bg-brand-50",
              borderColor: "hover:border-brand-300",
            },
            {
              icon: <Users className="h-7 w-7 text-accent-blue-500" />,
              title: "团队协作",
              desc: "创建小队，邀请好友一起训练",
              color: "bg-accent-blue-50",
              borderColor: "hover:border-accent-blue-300",
            },
            {
              icon: <Trophy className="h-7 w-7 text-accent-orange-500" />,
              title: "排行榜",
              desc: "队内 PK，按重量或次数排名",
              color: "bg-accent-orange-50",
              borderColor: "hover:border-accent-orange-300",
            },
            {
              icon: <Zap className="h-7 w-7 text-accent-purple-500" />,
              title: "实时追踪",
              desc: "训练中实时更新，推送给队友",
              color: "bg-accent-purple-50",
              borderColor: "hover:border-accent-purple-300",
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className={`group rounded-2xl border border-surface-200 bg-white p-6 text-center shadow-card transition-all duration-300 hover:shadow-cardHover hover:-translate-y-1 ${feature.borderColor}`}
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="mt-4 font-semibold text-surface-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-surface-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-surface-400">
        <p>FitSquad — 健身打卡与社交应用 · 所有重量使用 KG</p>
      </footer>
    </div>
  );
}
