"use client";
import { useState, useEffect, useCallback, type ReactElement } from "react";
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
    captcha: "計算して答えを入力",
    captchaPlaceholder: "答えを入力",
    submit: "登録する",
    loading: "登録中...",
    hasAccount: "アカウントをお持ちですか？",
    login: "ログイン",
    captchaError: "CAPTCHAが正しくないか期限切れです",
    refresh: "新しい問題",
  },
  en: {
    back: "← Back to Home",
    subtitle: "Create Account",
    name: "Name",
    email: "Email",
    password: "Password",
    captcha: "Solve the math problem",
    captchaPlaceholder: "Enter answer",
    submit: "Register",
    loading: "Registering...",
    hasAccount: "Already have an account?",
    login: "Sign In",
    captchaError: "CAPTCHA is incorrect or expired",
    refresh: "New question",
  },
  vi: {
    back: "← Về trang chủ",
    subtitle: "Đăng ký",
    name: "Họ tên",
    email: "Email",
    password: "Mật khẩu",
    captcha: "Giải phép tính để xác minh",
    captchaPlaceholder: "Nhập đáp án",
    submit: "Đăng ký",
    loading: "Đang đăng ký...",
    hasAccount: "Đã có tài khoản?",
    login: "Đăng nhập",
    captchaError: "CAPTCHA không đúng hoặc đã hết hạn",
    refresh: "Câu hỏi mới",
  },
};

const apiBase =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3041/v1")
    : "http://localhost:3041/v1";

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

  // CAPTCHA state
  const [captchaId, setCaptchaId] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setCaptchaAnswer("");
    try {
      const res = await fetch(`${apiBase}/auth/captcha`);
      const json = await res.json();
      const data = json.data ?? json;
      setCaptchaId(data.captchaId);
      setCaptchaQuestion(data.question);
    } catch {
      setCaptchaQuestion("Error loading captcha");
    }
    setCaptchaLoading(false);
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaAnswer.trim()) {
      setError(l.captchaError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiMutate("auth/register", "POST", {
        name,
        email,
        password,
        captchaId,
        captchaAnswer: Number(captchaAnswer),
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      // Reload captcha on error (used captcha is invalidated)
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition";

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
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{l.email}</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{l.password}</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
            </div>

            {/* CAPTCHA */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{l.captcha}</label>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex-1 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-center">
                  {captchaLoading ? (
                    <span className="text-sm text-slate-500 animate-pulse">Loading...</span>
                  ) : (
                    <span className="font-mono text-lg font-bold text-amber-300 tracking-wide">{captchaQuestion}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={loadCaptcha}
                  disabled={captchaLoading}
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg text-slate-400 transition hover:border-cyan-400/30 hover:text-cyan-300 disabled:opacity-50"
                  title={l.refresh}
                >
                  🔄
                </button>
              </div>
              <input
                type="number"
                required
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder={l.captchaPlaceholder}
                className={inputClass}
              />
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
