import type { ReactElement } from "react";
import { Header } from "../../../components/layout/Header";
import { Footer } from "../../../components/layout/Footer";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default function MainLayout({ children, params }: Props): ReactElement {
  const { locale } = params;

  return (
    <div
      data-locale={locale}
      className={locale === "vi" ? "vi-root relative flex min-h-screen flex-col" : "relative flex min-h-screen flex-col font-sans"}
    >
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/[0.06] blur-[120px]" />
        <div className="absolute -bottom-48 -left-32 h-[28rem] w-[28rem] rounded-full bg-brand-500/[0.05] blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-gold/[0.03] blur-[100px]" />
      </div>
      <Header />
      <main className="relative mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-24 lg:pt-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
