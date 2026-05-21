import type { ReactElement } from "react";
import { apiFetch } from "../../../../lib/api";

type NewsItem = { slug: string; isPublished: boolean; publishedAt: string | null; translations: Array<{ title: string }> };

export default async function AdminNewsPage(): Promise<ReactElement> {
  let news: NewsItem[] = [];
  try {
    const res = await apiFetch<NewsItem[]>("news", { params: { locale: "ja", limit: 50 } });
    news = res.data;
  } catch { /* empty */ }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Tin tức</h1>
          <p className="mt-1 text-sm text-slate-500">{news.length} bài viết</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] bg-white/[0.03]">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-400">Tiêu đề</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Slug</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Ngày đăng</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {news.map((n) => (
              <tr key={n.slug} className="transition hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-medium text-slate-200">{n.translations[0]?.title ?? n.slug}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{n.slug}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{n.publishedAt ? new Date(n.publishedAt).toLocaleDateString("vi") : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${n.isPublished ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"}`}>
                    {n.isPublished ? "Đã đăng" : "Nháp"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
