"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, usePathname } from "../../i18n/navigation";

const navClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-cyan-300";

export function Header(): React.ReactElement {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const locales = [
    { code: "en", label: "EN" },
    { code: "vi", label: "VI" },
    { code: "ja", label: "JA" },
  ] as const;

  const switchLocale = (next: string): void => {
    const path = window.location.pathname.split("/").slice(2).join("/");
    window.location.href = `/${next}/${path}`;
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }): React.ReactElement => (
    <>
      <Link href="/products" className={mobile ? `${navClass} text-base` : navClass}>
        {t("products")}
      </Link>
      <Link href="/categories" className={mobile ? `${navClass} text-base` : navClass}>
        {t("categories")}
      </Link>
      <Link href="/sets" className={mobile ? `${navClass} text-base` : navClass}>
        {t("sets")}
      </Link>
      <Link href="/pokemon" className={mobile ? `${navClass} text-base` : navClass}>
        {t("pokemon")}
      </Link>
      <Link href="/rankings" className={mobile ? `${navClass} text-base` : navClass}>
        {t("rankings")}
      </Link>
      <Link href="/news" className={mobile ? `${navClass} text-base` : navClass}>
        {t("news")}
      </Link>
      <Link href="/events" className={mobile ? `${navClass} text-base` : navClass}>
        {t("events")}
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface/80 shadow-lg shadow-black/20 backdrop-blur-2xl">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="BloxTCGShop"
            className="h-10 w-10 rounded-xl object-contain shadow-lg shadow-cyan-500/20 ring-1 ring-white/10 transition group-hover:shadow-cyan-400/30"
          />
          <span className="font-display text-xl font-bold tracking-tight text-gradient-brand">{t("appName")}</span>
        </Link>

        <nav className="hidden items-center gap-0.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1 backdrop-blur-sm md:flex lg:gap-1">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="hidden items-center rounded-xl border border-white/[0.1] bg-white/[0.04] p-0.5 shadow-sm sm:flex"
            role="group"
            aria-label={t("language")}
          >
            {locales.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => switchLocale(code)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                  locale === code
                    ? "bg-gradient-to-b from-brand-500 to-cyan-600 text-white shadow-md shadow-cyan-500/20"
                    : "text-slate-500 hover:bg-white/[0.08] hover:text-cyan-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-slate-400 shadow-sm transition hover:border-cyan-400/30 hover:text-cyan-300 md:hidden"
            aria-expanded={mobileOpen}
            aria-label="Menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            aria-hidden
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,20rem)] flex-col border-l border-white/[0.08] bg-surface-50/95 p-6 shadow-2xl backdrop-blur-2xl md:hidden">
            <div className="mb-6 font-display text-lg font-bold text-gradient-brand">{t("browse")}</div>
            <nav className="flex flex-col gap-1">
              <NavLinks mobile />
            </nav>
            <div className="mt-8 border-t border-white/[0.08] pt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{t("language")}</p>
              <div className="flex gap-2">
                {locales.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => switchLocale(code)}
                    className={`flex-1 rounded-xl py-2 text-sm font-bold ${
                      locale === code ? "bg-gradient-to-r from-brand-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20" : "bg-white/[0.06] text-slate-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
