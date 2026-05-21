import type { ReactElement } from "react";
import { apiFetch } from "../../../../lib/api";

type Category = { id: string; slug: string; sortOrder: number; translations: Array<{ name: string }>; children?: Category[] };

export default async function AdminCategoriesPage(): Promise<ReactElement> {
  let categories: Category[] = [];
  try {
    categories = await apiFetch<Category[]>("categories", { params: { locale: "ja" } }).then((r) => r.data);
  } catch { /* empty */ }

  const renderCategory = (cat: Category, depth = 0): ReactElement => (
    <div key={cat.id}>
      <div className={`flex items-center justify-between rounded-xl px-4 py-3 transition hover:bg-white/[0.04] ${depth > 0 ? "ml-8" : ""}`}>
        <div className="flex items-center gap-3">
          <span className="text-base">{depth === 0 ? "📁" : "📄"}</span>
          <span className="font-medium text-slate-200">{cat.translations[0]?.name ?? cat.slug}</span>
          <span className="text-xs text-slate-600">({cat.slug})</span>
        </div>
        <span className="text-xs text-slate-500">#{cat.sortOrder}</span>
      </div>
      {cat.children?.map((child) => renderCategory(child, depth + 1))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Danh mục</h1>
          <p className="mt-1 text-sm text-slate-500">{categories.length} danh mục gốc</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2">
        {categories.map((cat) => renderCategory(cat))}
      </div>
    </div>
  );
}
