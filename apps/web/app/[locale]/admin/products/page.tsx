"use client";
import { type ReactElement, useState, useEffect } from "react";

type Product = { id: string; slug: string; name: string; price: number; salePrice: number | null; stock: number; status: string; imageUrl: string | null; categoryName: string | null };

export default function AdminProducts(): ReactElement {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: "", sku: "", price: 0, stock: 0, nameJa: "", nameVi: "", descJa: "", descVi: "", categoryId: "" });
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3041/v1";

  const load = () => {
    fetch(`${apiBase}/products?limit=100`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setProducts(d.data ?? []))
      .catch(() => {});
  };
  useEffect(load, [apiBase]);

  const handleSave = async () => {
    const body = {
      slug: form.slug, sku: form.sku, price: form.price, stock: form.stock, categoryId: form.categoryId || undefined,
      translations: [
        { locale: "ja", name: form.nameJa, description: form.descJa },
        { locale: "vi", name: form.nameVi, description: form.descVi },
      ],
    };
    const url = editId ? `${apiBase}/products/${editId}` : `${apiBase}/products`;
    await fetch(url, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "include" });
    setShowForm(false); setEditId(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa sản phẩm?")) return;
    await fetch(`${apiBase}/products/${id}`, { method: "DELETE", credentials: "include" });
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">📦 Quản lý sản phẩm</h1>
        <button onClick={() => { setEditId(null); setForm({ slug: "", sku: "", price: 0, stock: 0, nameJa: "", nameVi: "", descJa: "", descVi: "", categoryId: "" }); setShowForm(true); }} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500">+ Thêm sản phẩm</button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-[#1a1d2e] p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">{editId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
            <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
            <input placeholder="Giá (¥)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
            <input placeholder="Tồn kho" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
            <input placeholder="Tên (日本語)" value={form.nameJa} onChange={(e) => setForm({ ...form, nameJa: e.target.value })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
            <input placeholder="Tên (Tiếng Việt)" value={form.nameVi} onChange={(e) => setForm({ ...form, nameVi: e.target.value })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
            <textarea placeholder="Mô tả (日本語)" value={form.descJa} onChange={(e) => setForm({ ...form, descJa: e.target.value })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
            <textarea placeholder="Mô tả (Tiếng Việt)" value={form.descVi} onChange={(e) => setForm({ ...form, descVi: e.target.value })} className="rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
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
            <th className="px-4 py-3">Ảnh</th><th className="px-4 py-3">Tên</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Giá</th><th className="px-4 py-3">Kho</th><th className="px-4 py-3">Danh mục</th><th className="px-4 py-3">Thao tác</th>
          </tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="px-4 py-3">{p.imageUrl ? <img src={p.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <span className="text-slate-600">—</span>}</td>
                <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                <td className="px-4 py-3 text-slate-400">{p.slug}</td>
                <td className="px-4 py-3 text-cyan-400">¥{p.price.toLocaleString()}</td>
                <td className="px-4 py-3"><span className={p.stock > 0 ? "text-emerald-400" : "text-red-400"}>{p.stock}</span></td>
                <td className="px-4 py-3 text-slate-400">{p.categoryName ?? "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:text-red-300">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
