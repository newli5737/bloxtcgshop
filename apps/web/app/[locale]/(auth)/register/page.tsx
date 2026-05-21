"use client";
import { useState, type ReactElement } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiMutate } from "../../../../lib/api";

const t: Record<string, Record<string, string>> = {
  ja: {
    back: "← ホームへ戻る",
    subtitle: "新規登録",
    name: "お名前",
    email: "メールアドレス",
    password: "パスワード",
    submit: "登録する",
    loading: "登録中...",
    hasAccount: "アカウントをお持ちですか？",
    login: "ログイン",
  },
  en: {
    back: "← Back to Home",
    subtitle: "Create Account",
    name: "Name",
    email: "Email",
    password: "Password",
    submit: "Register",
    loading: "Registering...",
    hasAccount: "Already have an account?",
    login: "Sign In",
  },
  vi: {
    back: "← Về trang chủ",
    subtitle: "Đăng ký",
    name: "Họ tên",
    email: "Email",
    password: "Mật khẩu",
    submit: "Đăng ký",
    loading: "Đang đăng ký...",
    hasAccount: "Đã có tài khoản?",
    login: "Đăng nhập",
  },
};

export default function RegisterPage(): ReactElement {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? "ja";
  const l = t[locale] ?? t.ja;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiMutate("auth/register", "POST", { name, email, password });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b10] px-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-600/[0.07] blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-500/[0.05] blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-cyan-400">
          {l.back}
        </Link>

        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold text-white">
              Blox<span className="text-cyan-400">TCG</span>Shop
            </h1>
            <p className="mt-2 text-sm text-slate-500">{l.subtitle}</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{l.name}</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{l.email}</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{l.password}</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/40 disabled:opacity-50">
              {loading ? l.loading : l.submit}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {l.hasAccount}{" "}
            <Link href="/login" className="text-cyan-400 transition hover:text-cyan-300">{l.login}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
