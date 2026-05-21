import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { Link } from "../../../i18n/navigation";
import { apiFetch } from "../../../lib/api";

type Pokemon = {
  slug: string;
  nameEn: string;
  spriteUrl: string | null;
};

export default async function PokemonIndexPage(): Promise<ReactElement> {
  const t = await getTranslations("common");
  const rows = await apiFetch<Pokemon[]>("pokemon").then((r) => r.data);

  return (
    <div className="space-y-10">
      <div className="glass-panel-strong px-6 py-8 sm:px-10">
        <SectionHeading eyebrow={t("browse")} title={t("pokemon")} />
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 lg:gap-4">
        {rows.map((p) => (
          <Link
            key={p.slug}
            href={`/pokemon/${p.slug}`}
            className="group flex flex-col items-center rounded-3xl border border-white/[0.08] bg-white/[0.04] p-4 text-center shadow-card backdrop-blur-sm transition hover:-translate-y-1 hover:border-cyan-400/25 hover:shadow-glow-sm"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-b from-surface-200 to-surface-300 shadow-inner ring-1 ring-white/[0.06]">
              {p.spriteUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.spriteUrl} alt="" className="h-[4.5rem] w-[4.5rem] object-contain transition group-hover:scale-110" />
              ) : (
                <span className="text-2xl text-slate-600">?</span>
              )}
            </div>
            <span className="mt-3 line-clamp-2 text-xs font-semibold leading-tight text-slate-300">{p.nameEn}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
