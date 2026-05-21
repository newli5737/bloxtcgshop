import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { Link } from "../../../../i18n/navigation";
import { SectionHeading } from "../../../../components/ui/SectionHeading";
import { apiFetch } from "../../../../lib/api";
import type { EventItem } from "../../../../lib/fetchers/events";

type Props = { params: { locale: string } };

const statusColors: Record<string, string> = {
  UPCOMING: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  OPEN: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  CLOSED: "border-slate-400/30 bg-slate-500/10 text-slate-400",
  DRAWN: "border-cyan-400/30 bg-cyan-500/10 text-cyan-300",
};

export default async function EventsPage({ params }: Props): Promise<ReactElement> {
  const { locale } = params;
  const te = await getTranslations("events");
  const tc = await getTranslations("common");
  const events = await apiFetch<EventItem[]>("events").then((r) => r.data);

  return (
    <div className="space-y-10">
      <div className="glass-panel-strong relative overflow-hidden px-6 py-8 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-24 top-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-[80px]" />
        <SectionHeading eyebrow={tc("browse")} title={te("title")} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-card backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-400/25 hover:shadow-card-hover"
          >
            {event.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.imageUrl} alt="" className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-surface-200 to-surface-400">
                <span className="font-display text-4xl text-cyan-500/30">🎉</span>
              </div>
            )}
            <div className="flex flex-1 flex-col p-5">
              <span className={`mb-3 inline-flex w-fit rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusColors[event.status] ?? statusColors.UPCOMING}`}>
                {te(event.status.toLowerCase() as "open" | "closed" | "drawn" | "upcoming")}
              </span>
              <h3 className="font-display text-lg font-bold text-slate-100 transition group-hover:text-cyan-300">
                {event.title}
              </h3>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span>👥 {event._count.registrations}/{event.maxParticipants}</span>
                {event.drawDate ? (
                  <span>📅 {new Date(event.drawDate).toLocaleDateString(locale)}</span>
                ) : null}
              </div>
              {event.status === "DRAWN" && event.winningNumber != null ? (
                <div className="mt-3 rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-sm font-bold text-amber-300">
                  🏆 {te("winningNumber")}: #{event.winningNumber}
                </div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
