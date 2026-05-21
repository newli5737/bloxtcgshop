import type { ReactElement } from "react";
import { apiFetch } from "../../../../lib/api";

type Banner = { id: string; imageUrl: string; linkUrl: string | null; isActive: boolean; sortOrder: number; translations: Array<{ title: string | null }> };

export default async function AdminBannersPage(): Promise<ReactElement> {
  let banners: Banner[] = [];
  try {
    banners = await apiFetch<Banner[]>("banners", { params: { locale: "ja" } }).then((r) => r.data);
  } catch { /* empty */ }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Banner</h1>
          <p className="mt-1 text-sm text-slate-500">{banners.length} banner</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {banners.map((b) => (
          <div key={b.id} className="overflow-hidden rounded-2xl border border-white/[0.06]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.imageUrl} alt="" className="h-36 w-full object-cover" />
            <div className="p-4">
              <p className="font-medium text-slate-200">{b.translations[0]?.title ?? "Untitled"}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                <span className={`rounded-full px-2 py-0.5 font-bold ${b.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"}`}>
                  {b.isActive ? "Hoạt động" : "Ẩn"}
                </span>
                <span>#{b.sortOrder}</span>
                {b.linkUrl ? <span className="truncate">{b.linkUrl}</span> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
