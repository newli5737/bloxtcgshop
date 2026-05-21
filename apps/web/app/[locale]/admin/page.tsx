"use client";
import { type ReactElement, useState, useEffect } from "react";

type Stat = { totalProducts: number; totalCategories: number; outOfStock: number; newThisWeek: number };

export default function AdminDashboard(): ReactElement {
  const [stats, setStats] = useState<Stat | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3041/v1";

  useEffect(() => {
    fetch(`${apiBase}/admin/stats`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setStats(d.data ?? d))
      .catch(() => {});
  }, [apiBase]);

  const cards = stats
    ? [
        { label: "Tổng sản phẩm", value: stats.totalProducts, icon: "📦", color: "from-cyan-500/20 to-cyan-500/5" },
        { label: "Danh mục", value: stats.totalCategories, icon: "📁", color: "from-violet-500/20 to-violet-500/5" },
        { label: "Hết hàng", value: stats.outOfStock, icon: "⚠️", color: "from-amber-500/20 to-amber-500/5" },
        { label: "Mới tuần này", value: stats.newThisWeek, icon: "🆕", color: "from-emerald-500/20 to-emerald-500/5" },
      ]
    : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">📊 Bảng điều khiển</h1>
      {!stats ? (
        <p className="text-slate-400">Đang tải...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br ${c.color} p-5`}>
              <div className="text-2xl">{c.icon}</div>
              <div className="mt-2 text-3xl font-bold text-white">{c.value}</div>
              <div className="mt-1 text-sm text-slate-400">{c.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
