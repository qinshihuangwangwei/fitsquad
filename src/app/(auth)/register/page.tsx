"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 密码规则校验
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

    // 自动登录
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
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <Dumbbell className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-surface-900">
            加入 FitSquad
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            创建账号，开始组团健身
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
              className="mt-1.5 w-full rounded-lg border border-surface-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
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
              className="mt-1.5 w-full rounded-lg border border-surface-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 8 位，含大小写字母和数字"
              required
              className="mt-1.5 w-full rounded-lg border border-surface-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
            />
            {/* 密码规则指示器 */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                {[
                  { key: "minLength" as const, label: "至少 8 个字符" },
                  { key: "hasUpper" as const, label: "至少一个大写字母" },
                  { key: "hasLower" as const, label: "至少一个小写字母" },
                  { key: "hasDigit" as const, label: "至少一个数字" },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center gap-1.5 text-xs",
                      rules[key] ? "text-green-600" : "text-surface-400"
                    )}
                  >
                    {rules[key] ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
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
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              required
              className="mt-1.5 w-full rounded-lg border border-surface-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
            />
            {confirmPassword.length > 0 && (
              <p
                className={cn(
                  "mt-1 text-xs",
                  passwordsMatch ? "text-green-600" : "text-red-500"
                )}
              >
                {passwordsMatch ? "✓ 密码一致" : "✗ 密码不一致"}
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "注册中..." : "创建账号"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          已有账号？{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
            登录
          </Link>
        </p>

        <p className="mt-8 text-center">
          <Link href="/" className="text-xs text-surface-400 hover:text-surface-600">
            ← 返回首页
          </Link>
        </p>
      </div>
    </div>
  );
}
