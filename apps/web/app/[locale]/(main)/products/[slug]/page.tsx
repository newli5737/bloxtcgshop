import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { Link } from "../../../../../i18n/navigation";
import { apiFetch } from "../../../../../lib/api";

type ProductDetail = {
  slug: string;
  name: string;
  description: string | null;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  status: string;
  images: Array<{ url: string; altText: string | null }>;
  cardDetails: {
    hp: number | null;
    cardNumber: string | null;
    rarity: string | null;
    cardType: string | null;
    illustrator: string | null;
    setNumber: string | null;
  } | null;
  pokemon: Array<{ slug: string; nameEn: string }>;
};

type Props = { params: { locale: string; slug: string } };

function formatMoney(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : locale === "ja" ? "ja-JP" : "en-US", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function ProductDetailPage({ params }: Props): Promise<ReactElement> {
  const { locale, slug } = params;
  const tp = await getTranslations("product");
  const tc = await getTranslations("common");
  const product = await apiFetch<ProductDetail>(`products/${slug}`, { params: { locale } }).then((r) => r.data);

  const primary = product.images.find((i) => i.url) ?? product.images[0];
  const hasSale = product.salePrice != null && product.salePrice < product.price;

  return (
    <div className="space-y-10">
      <nav className="text-xs font-medium text-slate-500">
        <Link href="/products" className="transition hover:text-cyan-400">
          {tc("products")}
        </Link>
        <span className="mx-2 text-slate-600">/</span>
        <span className="text-slate-200">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-4">
          <div className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-surface-200 to-surface-300 shadow-card ring-1 ring-white/[0.04]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-cyan-500/[0.03] via-transparent to-amber-300/[0.03]" />
            {primary ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primary.url}
                alt={primary.altText ?? product.name}
                className="relative w-full object-contain p-4 sm:p-8"
              />
            ) : null}
          </div>
          {product.images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((im, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={im.url}
                  alt=""
                  className="h-20 w-14 shrink-0 rounded-lg border border-white/[0.08] object-cover shadow-md ring-1 ring-white/[0.06]"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col">
          <div className="glass-panel-strong p-6 sm:p-8">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{product.name}</h1>
            <p className="mt-2 font-mono text-xs text-slate-500">
              {tp("sku")}: <span className="text-slate-300">{product.sku}</span>
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              {hasSale ? (
                <>
                  <span className="font-display text-4xl font-bold text-accent-coral">{formatMoney(Number(product.salePrice), locale)}</span>
                  <span className="text-lg text-slate-500 line-through">{formatMoney(product.price, locale)}</span>
                </>
              ) : (
                <span className="font-display text-4xl font-bold text-cyan-400">{formatMoney(product.price, locale)}</span>
              )}
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-sm">
              <span
                className={`h-2 w-2 rounded-full ${
                  product.status === "ACTIVE" && product.stock > 5
                    ? "bg-accent-mint"
                    : product.stock > 0
                      ? "bg-amber-400"
                      : "bg-slate-500"
                }`}
              />
              <span className="font-medium text-slate-300">{product.status.replaceAll("_", " ")}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">
                {product.stock} {tp("stock").toLowerCase()}
              </span>
            </div>

            {product.cardDetails ? (
              <dl className="mt-8 grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm sm:grid-cols-3">
                {[
                  ["HP", product.cardDetails.hp],
                  ["#", product.cardDetails.cardNumber],
                  ["Rarity", product.cardDetails.rarity],
                  ["Type", product.cardDetails.cardType],
                  ["Artist", product.cardDetails.illustrator],
                  ["Set #", product.cardDetails.setNumber],
                ].map(([label, val]) => (
                  <div key={String(label)} className="rounded-lg bg-white/[0.04] px-3 py-2 shadow-sm">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</dt>
                    <dd className="mt-0.5 font-semibold text-slate-200">{val ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {product.description ? (
              <div
                className="prose prose-sm prose-invert mt-8 max-w-none leading-relaxed prose-p:text-slate-400"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              {product.pokemon.map((m) => (
                <Link
                  key={m.slug}
                  href={`/pokemon/${m.slug}`}
                  className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 shadow-sm transition hover:border-cyan-400/40 hover:shadow-glow-sm"
                >
                  {m.nameEn}
                </Link>
              ))}
            </div>

            <div className="mt-8 border-t border-white/[0.06] pt-6">
              <button
                type="button"
                className="w-full rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 to-brand-500/10 py-3.5 text-sm font-bold text-cyan-300 shadow-sm transition hover:border-cyan-400/40 hover:from-cyan-500/20 hover:to-brand-500/20 sm:w-auto sm:px-10"
              >
                {tp("addToWishlist")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
