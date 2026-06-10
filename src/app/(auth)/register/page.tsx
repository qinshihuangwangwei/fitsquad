"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Check, X, ArrowRight, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const rules = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
  };
  const allRulesPass = Object.values(rules).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!allRulesPass) {
      setError("密码不符合要求");
      return;
    }
    if (!passwordsMatch) {
      setError("两次密码输入不一致");
      return;
    }
    if (!name.trim()) {
      setError("请输入姓名");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: name.trim(), password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "注册失败");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-40 h-80 w-80 rounded-full bg-brand-100 opacity-40 blur-3xl" />
        <div className="absolute bottom-1/4 -left-40 h-96 w-96 rounded-full bg-accent-purple-100 opacity-30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-surface-200 bg-white/80 backdrop-blur-xl shadow-card p-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30">
              <Dumbbell className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-surface-900">
              加入 FitSquad
            </h1>
            <p className="mt-2 text-sm text-surface-500">
              创建账号，开始组团健身
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700">
                姓名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="你的名字"
                required
                maxLength={50}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="设置密码"
                  required
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-xs font-medium text-surface-500">密码要求：</p>
                  {[
                    { key: "minLength" as const, label: "至少 8 个字符" },
                    { key: "hasUpper" as const, label: "至少一个大写字母" },
                    { key: "hasLower" as const, label: "至少一个小写字母" },
                    { key: "hasDigit" as const, label: "至少一个数字" },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className={cn(
                        "flex items-center gap-2 text-xs",
                        rules[key] ? "text-green-600" : "text-surface-400"
                      )}
                    >
                      {rules[key] ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700">
                确认密码
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  required
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p
                  className={cn(
                    "mt-2 text-xs font-medium",
                    passwordsMatch ? "text-green-600" : "text-red-500"
                  )}
                >
                  {passwordsMatch ? "✓ 密码一致" : "✗ 密码不一致"}
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 animate-fade-in">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3.5 text-base font-semibold text-white shadow-button hover:shadow-buttonHover disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="h-full w-full animate-spin opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="animate-pnone"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  注册中...
                </>
              ) : (
                <>
                  创建账号
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-surface-500">
              已有账号？{" "}
              <Link
                href="/login"
                className="font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                登录
              </Link>
            </p>
          </div>

          <Link
            href="/"
            className="mt-6 block text-center text-xs text-surface-400 hover:text-surface-600 transition-colors"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
