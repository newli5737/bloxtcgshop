"use client";

import { useTranslations } from "next-intl";
import { Link } from "../../i18n/navigation";

export function Footer(): React.ReactElement {
  const t = useTranslations("common");
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/[0.06] bg-gradient-to-b from-surface via-surface-50 to-black text-slate-400">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,212,255,0.08),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt="BloxTCGShop"
                className="h-9 w-9 rounded-lg object-contain shadow-lg shadow-cyan-500/15 ring-1 ring-white/10"
              />
              <span className="font-display text-xl font-bold text-gradient-brand">{t("appName")}</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500">{t("footerTagline")}</p>
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-500">{t("browse")}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/products" className="text-slate-400 transition hover:text-cyan-300">
                  {t("products")}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-slate-400 transition hover:text-cyan-300">
                  {t("categories")}
                </Link>
              </li>
              <li>
                <Link href="/sets" className="text-slate-400 transition hover:text-cyan-300">
                  {t("sets")}
                </Link>
              </li>
              <li>
                <Link href="/pokemon" className="text-slate-400 transition hover:text-cyan-300">
                  {t("pokemon")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-500">Info</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/rankings" className="text-slate-400 transition hover:text-cyan-300">
                  {t("rankings")}
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-slate-400 transition hover:text-cyan-300">
                  {t("news")}
                </Link>
              </li>
              <li>
                <span className="cursor-default text-slate-600">{t("terms")}</span>
              </li>
              <li>
                <span className="cursor-default text-slate-600">{t("privacy")}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-xs text-slate-600 sm:flex-row">
          <span>© {new Date().getFullYear()} BloxTCGShop</span>
          <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-slate-500">
            Premium TCG Marketplace
          </span>
        </div>
      </div>
    </footer>
  );
}
