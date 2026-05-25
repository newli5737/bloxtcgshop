import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { SectionHeading } from "../../../../components/ui/SectionHeading";
import { Link } from "../../../../i18n/navigation";
import { apiFetch } from "../../../../lib/api";

export const dynamic = "force-dynamic";

type Category = {
  slug: string;
  translations: Array<{ name: string }>;
  iconUrl: string | null;
  children?: Category[];
};

type Props = { params: { locale: string } };

export default async function CategoriesPage({ params }: Props): Promise<ReactElement> {
  const { locale } = params;
  const t = await getTranslations("common");
  const rows = await apiFetch<Category[]>("categories", { params: { locale } }).then((r) => r.data);

  return (
    <div className="space-y-10">
      <div className="glass-panel-strong px-6 py-8 sm:px-10 sm:py-10">
        <SectionHeading eyebrow={t("browse")} title={t("categories")} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        {rows.map((c) => (
          <div
            key={c.slug}
            className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-card backdrop-blur-sm transition hover:border-cyan-400/20 hover:shadow-card-hover"
          >
            <Link href={`/categories/${c.slug}`} className="group flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-surface-200 to-surface-400 shadow-inner ring-1 ring-white/[0.08]">
                {c.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.iconUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-xl font-bold text-cyan-500/40">{c.slug[0]?.toUpperCase()}</span>
                )}
              </span>
              <span className="font-display text-lg font-semibold text-slate-100 group-hover:text-cyan-300">
                {c.translations[0]?.name ?? c.slug}
              </span>
            </Link>
            {c.children && c.children.length > 0 ? (
              <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-sm">
                {c.children.map((ch) => (
                  <li key={ch.slug}>
                    <Link href={`/categories/${ch.slug}`} className="flex items-center gap-2 text-slate-400 transition hover:text-cyan-300">
                      <span className="h-1 w-1 rounded-full bg-cyan-400/60" />
                      {ch.translations[0]?.name ?? ch.slug}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
