import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { Link } from "../../../i18n/navigation";
import { apiFetch } from "../../../lib/api";

type SetRow = {
  slug: string;
  translations: Array<{ name: string }>;
  logoUrl: string | null;
};

type Props = { params: { locale: string } };

export default async function SetsPage({ params }: Props): Promise<ReactElement> {
  const { locale } = params;
  const t = await getTranslations("common");
  const rows = await apiFetch<SetRow[]>("sets", { params: { locale } }).then((r) => r.data);

  return (
    <div className="space-y-10">
      <div className="glass-panel-strong px-6 py-8 sm:px-10">
        <SectionHeading eyebrow={t("browse")} title={t("sets")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {rows.map((s) => (
          <Link
            key={s.slug}
            href={`/sets/${s.slug}`}
            className="group flex items-center gap-5 rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-cyan-400/20 hover:shadow-card-hover"
          >
            <span className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-300 shadow-inner ring-1 ring-white/[0.06]">
              {s.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="font-display text-sm font-bold text-slate-500">TCG</span>
              )}
            </span>
            <span className="font-display text-lg font-semibold text-slate-100 group-hover:text-cyan-300">
              {s.translations[0]?.name ?? s.slug}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
