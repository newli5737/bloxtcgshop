import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { Link } from "../../../../i18n/navigation";
import { apiFetch } from "../../../../lib/api";
import type { EventItem } from "../../../../lib/fetchers/events";

type Props = { params: { locale: string; slug: string } };

export default async function EventDetailPage({ params }: Props): Promise<ReactElement> {
  const { locale, slug } = params;
  const te = await getTranslations("events");
  const event = await apiFetch<EventItem>(`events/${slug}`).then((r) => r.data);

  return (
    <div className="space-y-8">
      <nav className="text-xs font-medium text-slate-500">
        <Link href="/events" className="transition hover:text-cyan-400">
          {te("title")}
        </Link>
        <span className="mx-2 text-slate-600">/</span>
        <span className="text-slate-200">{event.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full rounded-3xl border border-white/[0.08] object-cover shadow-card"
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-white/[0.08] bg-gradient-to-br from-surface-200 to-surface-400 shadow-card">
              <span className="text-7xl">🎉</span>
            </div>
          )}
        </div>

        <div className="glass-panel-strong p-6 sm:p-8">
          <h1 className="font-display text-3xl font-bold text-white">{event.title}</h1>

          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              👥 {event._count.registrations}/{event.maxParticipants} {te("participants")}
            </span>
            {event.drawDate ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                📅 {te("drawDate")}: {new Date(event.drawDate).toLocaleDateString(locale)}
              </span>
            ) : null}
          </div>

          {event.description ? (
            <div className="prose prose-sm prose-invert mt-6 max-w-none prose-p:text-slate-400">
              <p>{event.description}</p>
            </div>
          ) : null}

          {event.prizeDescription ? (
            <div className="mt-6 rounded-2xl border border-amber-400/15 bg-amber-500/5 p-5">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-amber-300">
                🎁 {te("prize")}
              </h3>
              <p className="mt-2 text-sm text-slate-300">{event.prizeDescription}</p>
            </div>
          ) : null}

          {event.status === "DRAWN" && event.winningNumber != null ? (
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6 text-center">
              <p className="text-sm font-semibold text-emerald-300">🏆 {te("winningNumber")}</p>
              <p className="mt-2 font-display text-5xl font-black text-emerald-400">
                #{event.winningNumber}
              </p>
            </div>
          ) : null}

          {event.status === "OPEN" ? (
            <div className="mt-6 border-t border-white/[0.06] pt-6">
              <p className="text-sm text-slate-400">{te("loginRequired")}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
