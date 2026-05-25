import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { ProductCard, type CatalogProduct } from "../../../../components/product/ProductCard";
import { SectionHeading } from "../../../../components/ui/SectionHeading";
import { Link } from "../../../../i18n/navigation";
import { apiFetch } from "../../../../lib/api";

export const dynamic = "force-dynamic";

type Props = {
  params: { locale: string };
  searchParams: Record<string, string | string[] | undefined>;
};

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function buildProductsHref(
  searchParams: Record<string, string | string[] | undefined>,
  overrides: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (k === "page") continue;
    const fv = first(v);
    if (fv) params.set(k, fv);
  }
  for (const [k, v] of Object.entries(overrides)) {
    if (v === undefined) continue;
    params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

export default async function ProductsPage({ params, searchParams }: Props): Promise<ReactElement> {
  const { locale } = params;
  const t = await getTranslations("common");
  const tp = await getTranslations("product");

  const page = Number(first(searchParams.page) ?? "1") || 1;
  const q = first(searchParams.q);
  const categorySlug = first(searchParams.categorySlug);
  const setSlug = first(searchParams.setSlug);

  const { data, meta } = await apiFetch<CatalogProduct[]>("products", {
    params: {
      locale,
      page,
      limit: 24,
      q,
      categorySlug,
      setSlug,
      sortBy: first(searchParams.sortBy),
    },
  });

  const totalPages = meta && typeof meta.totalPages === "number" ? meta.totalPages : 1;

  return (
    <div className="space-y-10">
      <div className="glass-panel-strong relative overflow-hidden px-6 py-8 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-24 top-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-[80px]" />
        <SectionHeading eyebrow={t("browse")} title={t("products")} description={tp("viewDetails")} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {data.map((p) => (
          <ProductCard key={p.slug} product={p} locale={locale} />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 ? (
            <Link
              href={buildProductsHref(searchParams, { page: page - 1 })}
              className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-300 shadow-sm transition hover:border-cyan-400/30 hover:text-cyan-300"
            >
              ← Prev
            </Link>
          ) : (
            <span className="rounded-xl border border-transparent px-5 py-2.5 text-sm text-slate-600">← Prev</span>
          )}
          <span className="rounded-xl bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={buildProductsHref(searchParams, { page: page + 1 })}
              className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-300 shadow-sm transition hover:border-cyan-400/30 hover:text-cyan-300"
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-xl border border-transparent px-5 py-2.5 text-sm text-slate-600">Next →</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
