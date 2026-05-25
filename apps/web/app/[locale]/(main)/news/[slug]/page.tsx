import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { Link } from "../../../../../i18n/navigation";
import { apiFetch } from "../../../../../lib/api";

export const dynamic = "force-dynamic";

type NewsDetail = {
  slug: string;
  publishedAt: string;
  translations: Array<{ title: string; content: string }>;
};

type Props = { params: { locale: string; slug: string } };

export default async function NewsDetailPage({ params }: Props): Promise<ReactElement> {
  const { locale, slug } = params;
  const t = await getTranslations("common");
  const th = await getTranslations("home");
  const item = await apiFetch<NewsDetail>(`news/${slug}`, { params: { locale } }).then((r) => r.data);
  const tr = item.translations[0];

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/news" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 transition hover:text-cyan-300">
        ← {th("backToNews")}
      </Link>
      <div className="glass-panel-strong overflow-hidden p-8 sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400/80">
          {t("news")} · {new Date(item.publishedAt).toLocaleDateString(locale, { dateStyle: "long" })}
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{tr?.title ?? item.slug}</h1>
        {tr?.content ? (
          <div
            className="prose prose-invert prose-lg mt-10 max-w-none prose-headings:font-display prose-a:text-cyan-400 prose-p:text-slate-300"
            dangerouslySetInnerHTML={{ __html: tr.content }}
          />
        ) : null}
      </div>
    </article>
  );
}
