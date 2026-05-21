"use client";
import { type ReactElement, useState, useEffect } from "react";

type Banner = { id: string; imageUrl: string; linkUrl: string | null; sortOrder: number; isActive: boolean; translations: Array<{ title: string | null; locale: string }> };

export default function AdminBanners(): ReactElement {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ imageUrl: "", linkUrl: "", sortOrder: 0, titleJa: "", titleVi: "" });
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3041/v1";

  const load = () => {
    fetch(`${apiBase}/banners/all`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setBanners(d.data ?? d ?? []))
      .catch(() => {});
  };
  useEffect(load, [apiBase]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${apiBase}/admin/upload`, { method: "POST", body: fd, credentials: "include" });
    const data = await res.json();
    setForm({ ...form, imageUrl: data.data?.url ?? data.url ?? "" });
  };

  const handleSave = async () => {
    const body = { imageUrl: form.imageUrl, linkUrl: form.linkUrl || undefined, sortOrder: form.sortOrder, translations: [{ locale: "ja", title: form.titleJa }, { locale: "vi", title: form.titleVi }] };
    await fetch(`${apiBase}/banners`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "include" });
    setShowForm(false); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa banner?")) return;
    await fetch(`${apiBase}/banners/${id}`, { method: "DELETE", credentials: "include" });
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">🖼️ Quản lý Banner</h1>
        <button onClick={() => { setForm({ imageUrl: "", linkUrl: "", sortOrder: 0, titleJa: "", titleVi: "" }); setShowForm(true); }} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500">+ Thêm banner</button>
      </div>
      {showForm && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-[#1a1d2e] p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-slate-400">Upload ảnh</label>
              <input type="file" accept="image/*" onChange={handleUpload} className="text-sm text-slate-400" />
              {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 h-24 rounded-lg" />}
            </div>
            <input placeholder="Link URL" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
            <input placeholder="Thứ tự" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
            <input placeholder="Tiêu đề (日本語)" value={form.titleJa} onChange={(e) => setForm({ ...form, titleJa: e.target.value })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
            <input placeholder="Tiêu đề (Tiếng Việt)" value={form.titleVi} onChange={(e) => setForm({ ...form, titleVi: e.target.value })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500">Lưu</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-600">Hủy</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((b) => (
          <div key={b.id} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#13151d]">
            <img src={b.imageUrl} alt="" className="h-40 w-full object-cover" />
            <div className="p-4">
              <p className="text-sm font-medium text-white">{b.translations[0]?.title ?? "Banner"}</p>
              <p className="mt-1 text-xs text-slate-400">Thứ tự: {b.sortOrder} | {b.isActive ? "✅ Đang hiển thị" : "❌ Ẩn"}</p>
              <button onClick={() => handleDelete(b.id)} className="mt-2 text-xs text-red-400 hover:text-red-300">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
