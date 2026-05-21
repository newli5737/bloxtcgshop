import type { ReactElement } from "react";
import { apiFetch } from "../../../lib/api";

type Stats = {
  totalProducts: number;
  totalCategories: number;
  outOfStock: number;
  newThisWeek: number;
};

export default async function AdminDashboardPage(): Promise<ReactElement> {
  let stats: Stats = { totalProducts: 0, totalCategories: 0, outOfStock: 0, newThisWeek: 0 };
  try {
    stats = await apiFetch<Stats>("admin/stats").then((r) => r.data);
  } catch {
    // Stats may fail if not authenticated on server-side render
  }

  const cards = [
    { label: "Tổng sản phẩm", value: stats.totalProducts, icon: "📦", color: "from-cyan-500/20 to-cyan-600/10 border-cyan-400/20" },
    { label: "Tổng danh mục", value: stats.totalCategories, icon: "📁", color: "from-emerald-500/20 to-emerald-600/10 border-emerald-400/20" },
    { label: "Hết hàng", value: stats.outOfStock, icon: "⚠️", color: "from-amber-500/20 to-amber-600/10 border-amber-400/20" },
    { label: "Mới trong tuần", value: stats.newThisWeek, icon: "✨", color: "from-violet-500/20 to-violet-600/10 border-violet-400/20" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Bảng điều khiển</h1>
        <p className="mt-1 text-sm text-slate-500">Tổng quan hệ thống BloxTCGShop</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border bg-gradient-to-br p-5 shadow-card ${card.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-white">{card.value}</p>
            <p className="mt-1 text-xs font-medium text-slate-400">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
