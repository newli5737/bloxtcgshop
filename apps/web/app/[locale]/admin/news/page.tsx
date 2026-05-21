"use client";
import { type ReactElement, useState, useEffect } from "react";

type NewsItem = { id: string; slug: string; isPublished: boolean; createdAt: string; translations: Array<{ title: string; locale: string }> };

export default function AdminNews(): ReactElement {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: "", isPublished: false, titleJa: "", titleVi: "", contentJa: "", contentVi: "" });
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3041/v1";

  const load = () => {
    fetch(`${apiBase}/news/admin/all`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setItems(d.data ?? []))
      .catch(() => {});
  };
  useEffect(load, [apiBase]);

  const handleSave = async () => {
    const body = {
      slug: form.slug, isPublished: form.isPublished,
      translations: [
        { locale: "ja", title: form.titleJa, content: form.contentJa },
        { locale: "vi", title: form.titleVi, content: form.contentVi },
      ],
    };
    const url = editId ? `${apiBase}/news/${editId}` : `${apiBase}/news`;
    await fetch(url, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "include" });
    setShowForm(false); setEditId(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa bài viết?")) return;
    await fetch(`${apiBase}/news/${id}`, { method: "DELETE", credentials: "include" });
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">📰 Quản lý Tin tức</h1>
        <button onClick={() => { setEditId(null); setForm({ slug: "", isPublished: false, titleJa: "", titleVi: "", contentJa: "", contentVi: "" }); setShowForm(true); }} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500">+ Thêm bài viết</button>
      </div>
      {showForm && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-[#1a1d2e] p-5">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
            <label className="flex items-center gap-2 text-sm text-white">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Xuất bản
            </label>
            <input placeholder="Tiêu đề (日本語)" value={form.titleJa} onChange={(e) => setForm({ ...form, titleJa: e.target.value })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
            <input placeholder="Tiêu đề (Tiếng Việt)" value={form.titleVi} onChange={(e) => setForm({ ...form, titleVi: e.target.value })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
            <textarea placeholder="Nội dung (日本語)" rows={4} value={form.contentJa} onChange={(e) => setForm({ ...form, contentJa: e.target.value })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
            <textarea placeholder="Nội dung (Tiếng Việt)" rows={4} value={form.contentVi} onChange={(e) => setForm({ ...form, contentVi: e.target.value })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500">Lưu</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-600">Hủy</button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#13151d]">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-white/[0.06] text-slate-400">
            <th className="px-4 py-3">Tiêu đề</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Ngày tạo</th><th className="px-4 py-3">Thao tác</th>
          </tr></thead>
          <tbody>
            {items.map((n) => (
              <tr key={n.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-white">{n.translations[0]?.title ?? n.slug}</td>
                <td className="px-4 py-3 text-slate-400">{n.slug}</td>
                <td className="px-4 py-3">{n.isPublished ? <span className="text-emerald-400">✅ Đã xuất bản</span> : <span className="text-amber-400">📝 Nháp</span>}</td>
                <td className="px-4 py-3 text-slate-400">{new Date(n.createdAt).toLocaleDateString("vi")}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => { setEditId(n.id); setForm({ slug: n.slug, isPublished: n.isPublished, titleJa: "", titleVi: n.translations[0]?.title ?? "", contentJa: "", contentVi: "" }); setShowForm(true); }} className="text-xs text-cyan-400 hover:text-cyan-300">Sửa</button>
                  <button onClick={() => handleDelete(n.id)} className="text-xs text-red-400 hover:text-red-300">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
