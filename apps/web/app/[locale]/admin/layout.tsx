import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactElement, ReactNode } from "react";

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export default async function AdminLayout({ children, params }: Props): Promise<ReactElement> {
  const messages = await getMessages({ locale: "vi" });

  const headersList = headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isLogin = pathname.includes("/admin/login");

  // Login page: full-screen, no sidebar
  if (isLogin) {
    return (
      <NextIntlClientProvider messages={messages} locale="vi">
        {children}
      </NextIntlClientProvider>
    );
  }

  // Other admin pages: sidebar layout
  return (
    <NextIntlClientProvider messages={messages} locale="vi">
      <div className="flex min-h-screen bg-[#0f1117]">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-white/[0.06] bg-[#13151d]">
          <div className="flex h-16 items-center gap-2.5 border-b border-white/[0.06] px-5">
            <span className="text-xl">🎴</span>
            <span className="font-display text-lg font-bold text-gradient-brand">Admin</span>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            {[
              { href: `/${params.locale}/admin`, icon: "📊", label: "Bảng điều khiển" },
              { href: `/${params.locale}/admin/products`, icon: "📦", label: "Sản phẩm" },
              { href: `/${params.locale}/admin/categories`, icon: "📁", label: "Danh mục" },
              { href: `/${params.locale}/admin/banners`, icon: "🖼️", label: "Banner" },
              { href: `/${params.locale}/admin/news`, icon: "📰", label: "Tin tức" },
              { href: `/${params.locale}/admin/events`, icon: "🎉", label: "Sự kiện" },
              { href: `/${params.locale}/admin/users`, icon: "👥", label: "Người dùng" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-cyan-300"
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="border-t border-white/[0.06] p-3">
            <a
              href={`/${params.locale}`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-500 transition hover:text-cyan-400"
            >
              ← Về trang chủ
            </a>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-60 flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </NextIntlClientProvider>
  );
}
