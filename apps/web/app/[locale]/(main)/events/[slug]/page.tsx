"use client";
import { useState, useEffect, type ReactElement } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiMutate } from "../../../../../lib/api";

type EventItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  prizeDescription: string | null;
  imageUrl: string | null;
  status: string;
  maxParticipants: number;
  winningNumber: number | null;
  drawDate: string | null;
  _count: { registrations: number };
};

type Registration = {
  luckyNumber: number;
  isWinner: boolean;
};

type AuthUser = { id: string; email: string; name: string | null; role: string };

const statusLabels: Record<string, string> = {
  UPCOMING: "Coming Soon", OPEN: "Open", CLOSED: "Closed", DRAWN: "Drawn", CANCELLED: "Cancelled",
};

export default function EventDetailPage(): ReactElement {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [myReg, setMyReg] = useState<Registration | null>(null);
  const [registering, setRegistering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const ev = await apiGet<EventItem>(`events/${slug}`);
        setEvent(ev);
        try {
          const u = await apiGet<AuthUser>("users/me");
          setUser(u);
          try {
            const reg = await apiGet<Registration>(`events/${ev.id}/my-registration`);
            setMyReg(reg);
          } catch { /* not registered */ }
        } catch { /* not logged in */ }
      } catch (e) {
        setError((e as Error).message);
      } finally { setLoading(false); }
    };
    load();
  }, [slug]);

  const handleRegister = async () => {
    if (!event || !user) return;
    setRegistering(true);
    try {
      const result = await apiMutate<{ luckyNumber: number }>(`events/${event.id}/register`, "POST");
      setMyReg({ luckyNumber: result.luckyNumber, isWinner: false });
      // Refresh event count
      const ev = await apiGet<EventItem>(`events/${slug}`);
      setEvent(ev);
    } catch (e) {
      alert((e as Error).message);
    }
    setRegistering(false);
  };

  if (loading) return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="animate-pulse text-slate-500">Loading...</div>
    </div>
  );
  if (error || !event) return (
    <div className="py-20 text-center text-red-400">{error ?? "Event not found"}</div>
  );

  return (
    <div className="space-y-8">
      <nav className="text-xs font-medium text-slate-500">
        <Link href="/events" className="transition hover:text-cyan-400">Events</Link>
        <span className="mx-2 text-slate-600">/</span>
        <span className="text-slate-200">{event.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.imageUrl} alt={event.title} className="w-full rounded-3xl border border-white/[0.08] object-cover shadow-card" />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-white/[0.08] bg-gradient-to-br from-surface-200 to-surface-400 shadow-card">
              <span className="text-7xl">🎉</span>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8 backdrop-blur-sm">
          <h1 className="font-display text-3xl font-bold text-white">{event.title}</h1>

          <div className="mt-4 flex flex-wrap gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${event.status === "OPEN" ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300" : "border border-slate-400/20 bg-slate-500/10 text-slate-300"}`}>
              {statusLabels[event.status] ?? event.status}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              👥 {event._count.registrations}/{event.maxParticipants}
            </span>
            {event.drawDate && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                📅 {new Date(event.drawDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {event.description && (
            <div className="mt-6 text-sm leading-relaxed text-slate-400">{event.description}</div>
          )}

          {event.prizeDescription && (
            <div className="mt-6 rounded-2xl border border-amber-400/15 bg-amber-500/5 p-5">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-amber-300">🎁 Prize</h3>
              <p className="mt-2 text-sm text-slate-300">{event.prizeDescription}</p>
            </div>
          )}

          {/* Winning number */}
          {event.status === "DRAWN" && event.winningNumber != null && (
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6 text-center">
              <p className="text-sm font-semibold text-emerald-300">🏆 Winning Number</p>
              <p className="mt-2 font-display text-5xl font-black text-emerald-400">#{event.winningNumber}</p>
            </div>
          )}

          {/* Registration area */}
          <div className="mt-6 border-t border-white/[0.06] pt-6">
            {!user ? (
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-3">ログインして参加 / Login to participate</p>
                <Link href="/login" className="inline-block rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/40">
                  ログイン / Login
                </Link>
              </div>
            ) : myReg ? (
              <div className="text-center rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-6">
                <p className="text-sm font-semibold text-cyan-300 mb-2">✅ 登録済み / Registered</p>
                <p className="font-display text-4xl font-black text-cyan-400">#{myReg.luckyNumber}</p>
                <p className="mt-2 text-xs text-slate-400">Your lucky number</p>
                {myReg.isWinner && (
                  <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20 px-4 py-3">
                    <p className="text-sm font-bold text-emerald-400">🏆 おめでとう！You won! 🏆</p>
                  </div>
                )}
              </div>
            ) : event.status === "OPEN" ? (
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-3">参加してラッキーナンバーをゲット！</p>
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/40 disabled:opacity-50"
                >
                  {registering ? "登録中..." : "🎲 参加する / Join Event"}
                </button>
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500">Event is not open for registration</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
