import type { ReactElement } from "react";
import { Link } from "../../i18n/navigation";

export type CatalogProduct = {
  slug: string;
  name: string;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  status?: string;
};

type Props = {
  product: CatalogProduct;
  locale: string;
};

function formatMoney(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : locale === "ja" ? "ja-JP" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function ProductCard({ product, locale }: Props): ReactElement {
  const hasSale = product.salePrice != null && product.salePrice < product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-card backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-400/25 hover:shadow-card-hover"
    >
      {/* Holographic shine overlay on hover */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-cyan-500/0 via-white/0 to-brand-400/0 opacity-0 transition duration-500 group-hover:from-cyan-500/[0.03] group-hover:via-white/[0.02] group-hover:to-brand-400/[0.03] group-hover:opacity-100" />

      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-surface-200 to-surface-300">
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-surface/40 via-transparent to-white/[0.02] opacity-0 transition group-hover:opacity-100" />
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-4xl font-bold text-slate-600/40">
            ?
          </div>
        )}
        {hasSale ? (
          <span className="absolute left-2 top-2 z-20 rounded-lg bg-gradient-to-r from-accent-coral to-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md shadow-red-500/30">
            Sale
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] font-display text-sm font-semibold leading-snug text-slate-200 transition group-hover:text-cyan-300">
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="flex flex-col">
            {hasSale ? (
              <>
                <span className="font-display text-lg font-bold text-accent-coral">
                  {formatMoney(Number(product.salePrice), locale)}
                </span>
                <span className="text-xs text-slate-500 line-through">{formatMoney(product.price, locale)}</span>
              </>
            ) : (
              <span className="font-display text-lg font-bold text-cyan-400">{formatMoney(product.price, locale)}</span>
            )}
          </div>
            {product.status ? (
            <span className="max-w-[5.5rem] truncate rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {product.status.replaceAll("_", " ")}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
