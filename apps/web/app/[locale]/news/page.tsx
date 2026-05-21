import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { Link } from "../../../i18n/navigation";
import { apiFetch } from "../../../lib/api";

type NewsItem = {
  slug: string;
  publishedAt: string;
  translations: Array<{ title: string }>;
};

type Props = { params: { locale: string } };

export default async function NewsListPage({ params }: Props): Promise<ReactElement> {
  const { locale } = params;
  const t = await getTranslations("common");
  const { data } = await apiFetch<NewsItem[]>("news", { params: { locale, limit: 20 } });

  return (
    <div className="space-y-10">
      <div className="glass-panel-strong px-6 py-8 sm:px-10">
        <SectionHeading eyebrow={t("news")} title={t("news")} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        {data.map((n) => (
          <Link
            key={n.slug}
            href={`/news/${n.slug}`}
            className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-cyan-400/20 hover:shadow-card-hover"
          >
            <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-400 to-brand-600" />
            <div className="pl-4">
              <time className="text-xs font-bold uppercase tracking-widest text-cyan-400/80">
                {new Date(n.publishedAt).toLocaleDateString(locale, { dateStyle: "long" })}
              </time>
              <h2 className="mt-3 font-display text-xl font-semibold text-slate-100 transition group-hover:text-cyan-300">
                {n.translations[0]?.title ?? n.slug}
              </h2>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-cyan-400">
                {t("readMore")} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
