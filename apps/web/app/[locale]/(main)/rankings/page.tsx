import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { SectionHeading } from "../../../../components/ui/SectionHeading";
import { Link } from "../../../../i18n/navigation";
import { apiFetch } from "../../../../lib/api";
import type { CatalogProduct } from "../../../../components/product/ProductCard";

type Props = { params: { locale: string } };

export default async function RankingsPage({ params }: Props): Promise<ReactElement> {
  const { locale } = params;
  const t = await getTranslations("common");
  const th = await getTranslations("home");
  const tp = await getTranslations("product");
  const rows = await apiFetch<CatalogProduct[]>("rankings", { params: { type: "sales", limit: 25, locale } }).then((r) => r.data);

  return (
    <div className="space-y-10">
      <div className="glass-panel-strong px-6 py-8 sm:px-10">
        <SectionHeading eyebrow={th("badgeHot")} title={t("rankings")} description={tp("viewDetails")} />
      </div>
      <ol className="space-y-3">
        {rows.map((p, idx) => (
          <li key={p.slug}>
            <Link
              href={`/products/${p.slug}`}
              className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-cyan-400/20 hover:shadow-card"
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-sm font-black text-white shadow-lg ${
                idx < 3
                  ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/25"
                  : "bg-surface-300 text-slate-400"
              }`}>
                {idx + 1}
              </span>
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt="" className="h-16 w-12 rounded-xl object-cover shadow-md ring-1 ring-white/[0.06]" />
              ) : (
                <div className="h-16 w-12 rounded-xl bg-surface-300" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-display font-semibold text-slate-100">{p.name}</div>
                <div className="text-sm text-slate-500">
                  {tp("from")}{" "}
                  <span className="font-bold text-cyan-400">${Number(p.price).toFixed(2)}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
