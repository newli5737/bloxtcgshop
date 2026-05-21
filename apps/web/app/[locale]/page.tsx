import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { ProductCard, type CatalogProduct } from "../../components/product/ProductCard";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { Link } from "../../i18n/navigation";
import { apiFetch } from "../../lib/api";

type Banner = {
  id: string;
  imageUrl: string;
  linkUrl: string | null;
  translations: Array<{ title: string | null }>;
};

type NewsItem = {
  slug: string;
  publishedAt: string;
  translations: Array<{ title: string }>;
};

type Category = {
  slug: string;
  translations: Array<{ name: string }>;
  iconUrl: string | null;
};

type Pokemon = {
  slug: string;
  nameEn: string;
  spriteUrl: string | null;
};

type Props = {
  params: { locale: string };
};

export default async function HomePage({ params }: Props): Promise<ReactElement> {
  const { locale } = params;
  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const tp = await getTranslations("product");

  const [banners, rankings, newArrivals, categories, pokemon, news] = await Promise.all([
    apiFetch<Banner[]>("banners", { params: { locale } }).then((r) => r.data),
    apiFetch<CatalogProduct[]>("rankings", { params: { type: "sales", limit: 10, locale } }).then((r) => r.data),
    apiFetch<CatalogProduct[]>("products", {
      params: { isNewArrival: true, limit: 10, locale },
    }).then((r) => r.data),
    apiFetch<Category[]>("categories", { params: { locale } }).then((r) => r.data),
    apiFetch<Pokemon[]>("pokemon").then((r) => r.data),
    apiFetch<NewsItem[]>("news", { params: { locale, limit: 5 } }).then((r) => r.data),
  ]);

  const topRank = rankings.slice(0, 3);
  const restRank = rankings.slice(3, 10);

  return (
    <div className="space-y-16 pb-8 lg:space-y-24">
      {/* Hero — with generated banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] shadow-glow ring-1 ring-white/[0.04]">
        {/* Banner image background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-banner.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface/90 via-surface/70 to-surface/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />
        {/* Glow orbs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-brand-400/15 blur-[80px]" />
        {/* Pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-300 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-mint" />
            Trading Card Game
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300/90">{t("heroSubtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/products" className="btn-primary ring-1 ring-cyan-400/20">
              {t("shopNow")}
            </Link>
            <Link href="/rankings" className="btn-secondary">
              {tc("rankings")}
            </Link>
          </div>
        </div>
      </section>

      {/* Banner */}
      {banners[0] ? (
        <section>
          <a
            href={banners[0].linkUrl ?? "#"}
            className="group relative block overflow-hidden rounded-3xl border border-white/[0.08] shadow-card ring-1 ring-white/[0.04]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banners[0].imageUrl}
              alt={banners[0].translations[0]?.title ?? "Promo"}
              className="h-52 w-full object-cover transition duration-700 group-hover:scale-[1.02] sm:h-64 lg:h-72"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-surface/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
              <span className="text-sm font-medium text-slate-300">{banners[0].translations[0]?.title ?? "Featured"}</span>
            </div>
          </a>
        </section>
      ) : null}

      {/* Pokémon strip */}
      <section>
        <SectionHeading eyebrow={tc("browse")} title={t("pokemonNav")} />
        <div className="mask-fade-x -mx-1 overflow-x-auto pb-2">
          <div className="flex snap-x snap-mandatory gap-3 px-1 pb-2 pt-1 sm:gap-4">
            {pokemon.slice(0, 15).map((p) => (
              <Link
                key={p.slug}
                href={`/pokemon/${p.slug}`}
                className="group flex w-[5.5rem] shrink-0 snap-start flex-col items-center rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-cyan-400/25 hover:shadow-glow-sm sm:w-24"
              >
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-surface-200 to-surface-300 shadow-inner ring-1 ring-white/[0.06]">
                  {p.spriteUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.spriteUrl} alt="" className="h-14 w-14 object-contain transition group-hover:scale-110" />
                  ) : (
                    <span className="text-2xl opacity-30">?</span>
                  )}
                </div>
                <span className="mt-2 line-clamp-2 text-center text-[11px] font-semibold leading-tight text-slate-300">{p.nameEn}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <SectionHeading eyebrow={tc("categories")} title={t("categories")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-cyan-400/25 hover:shadow-card-hover"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-surface-200 to-surface-400 shadow-inner ring-1 ring-white/[0.08]">
                {c.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.iconUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-lg font-bold text-cyan-500/50">{c.slug[0]?.toUpperCase()}</span>
                )}
              </span>
              <span className="font-display text-sm font-semibold text-slate-200 group-hover:text-cyan-300">
                {c.translations[0]?.name ?? c.slug}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section>
        <SectionHeading
          eyebrow={t("badgeNew")}
          title={t("newArrivals")}
          action={
            <Link href="/products" className="link-subtle text-sm font-semibold text-cyan-400">
              {tc("products")} →
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {newArrivals.map((p) => (
            <ProductCard key={p.slug} product={p} locale={locale} />
          ))}
        </div>
      </section>

      {/* Rankings — podium + list */}
      <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-card backdrop-blur-sm sm:p-8 lg:p-10">
        <SectionHeading
          eyebrow={t("badgeHot")}
          title={t("rankings")}
          action={
            <Link href="/rankings" className="rounded-xl bg-gradient-to-r from-brand-500 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-brand-400 hover:to-cyan-500">
              {tc("rankings")}
            </Link>
          }
        />
        {topRank.length >= 3 ? (
          <div className="mb-10 grid grid-cols-3 gap-3 sm:gap-6">
            {[1, 0, 2].map((idx) => {
              const p = topRank[idx];
              const place = idx === 1 ? 1 : idx === 0 ? 2 : 3;
              const heights = idx === 1 ? "sm:pt-0" : idx === 0 ? "sm:pt-8" : "sm:pt-10";
              return (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className={`relative flex flex-col items-center text-center ${heights}`}
                >
                  <div
                    className={`relative w-full max-w-[10rem] overflow-hidden rounded-2xl border bg-surface-200 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover ${
                      place === 1 ? "border-amber-400/60 ring-4 ring-amber-400/20 shadow-glow-gold" : "border-white/[0.1] ring-1 ring-white/[0.06]"
                    }`}
                  >
                    <div className="aspect-[3/4] bg-surface-300">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="absolute -top-3 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-sm font-black text-white shadow-lg shadow-amber-500/30">
                      {place}
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 max-w-[10rem] text-xs font-semibold text-slate-200 sm:text-sm">{p.name}</p>
                </Link>
              );
            })}
          </div>
        ) : null}
        <ol className="space-y-2">
          {(topRank.length >= 3 ? restRank : rankings).map((p, i) => (
            <li key={p.slug}>
              <Link
                href={`/products/${p.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-transparent bg-white/[0.03] px-3 py-2.5 transition hover:border-cyan-400/20 hover:bg-white/[0.06] hover:shadow-md"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-300 font-display text-sm font-bold text-slate-400">
                  {(topRank.length >= 3 ? 4 : 1) + i}
                </span>
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="h-14 w-10 rounded-lg object-cover shadow-sm ring-1 ring-white/[0.06]" />
                ) : (
                  <div className="h-14 w-10 rounded-lg bg-surface-300" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-slate-200">{p.name}</div>
                  <div className="text-xs text-slate-500">
                    {tp("from")}{" "}
                    <span className="font-semibold text-cyan-400">${Number(p.price).toFixed(2)}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* News */}
      <section>
        <SectionHeading
          eyebrow={tc("news")}
          title={t("news")}
          action={
            <Link href="/news" className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300">
              {t("viewAll")} →
            </Link>
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          {news.map((n) => (
            <Link
              key={n.slug}
              href={`/news/${n.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-cyan-400/20 hover:shadow-card-hover"
            >
              <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-400 to-brand-600 opacity-80" />
              <div className="pl-3">
                <time className="text-xs font-semibold uppercase tracking-wide text-cyan-400/80">
                  {new Date(n.publishedAt).toLocaleDateString(locale, { dateStyle: "medium" })}
                </time>
                <h3 className="mt-2 font-display text-lg font-semibold text-slate-100 transition group-hover:text-cyan-300">
                  {n.translations[0]?.title ?? n.slug}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
