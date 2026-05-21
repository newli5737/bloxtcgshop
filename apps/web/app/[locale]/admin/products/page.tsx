"use client";
import { type ReactElement, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useAdminCrud } from "../../../../lib/hooks/useAdminCrud";
import {
  adminProducts, adminCategories, adminUpload,
  type AdminProduct, type AdminCategory, type CreateProductPayload, type UpdateProductPayload,
} from "../../../../lib/fetchers/admin";
import {
  AdminPageHeader, Modal, AdminTable, Field, Input, TextArea, Select, Checkbox, FileInput,
  BtnPrimary, BtnSecondary, BtnAction, LoadingState, EmptyState, ErrorBanner,
} from "../../../../components/admin/AdminUI";

const productActions = {
  list: () => adminProducts.list("ja"),
  create: (d: CreateProductPayload) => adminProducts.create(d),
  update: (id: string, d: UpdateProductPayload) => adminProducts.update(id, d),
  remove: (id: string) => adminProducts.remove(id),
};

const initForm = { slug: "", sku: "", price: 0, salePrice: "", stock: 0, nameJa: "", nameVi: "", descJa: "", descVi: "", categoryId: "", isFeatured: false, isNewArrival: false };
type FormState = typeof initForm;

const PAGE_SIZE = 15;

export default function AdminProductsPage(): ReactElement {
  const { items, loading, error, saving, create, update, remove } = useAdminCrud(productActions);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<FormState>(initForm);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Search & pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useMemo(() => { adminCategories.list("ja").then(setCategories).catch(() => {}); }, []);

  const set = useCallback((patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch })), []);

  // Filtered items
  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      (p.categoryName ?? "").toLowerCase().includes(q)
    );
  }, [items, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset page when search changes
  const handleSearch = (val: string) => { setSearch(val); setPage(1); };

  const openCreate = () => { setEditId(null); setForm(initForm); setImagePreview(null); setDetail(null); setShowForm(true); };
  const openEdit = (p: AdminProduct) => {
    setEditId(p.id);
    setForm({ slug: p.slug, sku: p.sku, price: p.price, salePrice: p.salePrice?.toString() ?? "", stock: p.stock, nameJa: p.name, nameVi: "", descJa: "", descVi: "", categoryId: "", isFeatured: p.isFeatured, isNewArrival: p.isNewArrival });
    setImagePreview(p.imageUrl); setDetail(null); setShowForm(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const res = await adminUpload.file(file); setImagePreview(res.url); } catch { /* empty */ }
    setUploading(false);
  };

  const handleSave = async () => {
    const payload: CreateProductPayload = {
      slug: form.slug, sku: form.sku, price: form.price, stock: form.stock,
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      categoryId: form.categoryId || undefined, isFeatured: form.isFeatured, isNewArrival: form.isNewArrival,
      imageUrl: imagePreview || undefined,
      translations: [
        { locale: "ja", name: form.nameJa, description: form.descJa },
        { locale: "vi", name: form.nameVi || form.nameJa, description: form.descVi || form.descJa },
      ],
    };
    try {
      if (editId) { await update(editId, payload); } else { await create(payload); }
      setShowForm(false); setEditId(null);
    } catch (err) {
      console.error("[handleSave] ERROR:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa sản phẩm này?")) return;
    await remove(id);
    if (detail?.id === id) setDetail(null);
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      {error && <ErrorBanner message={error} onDismiss={() => {}} />}

      <AdminPageHeader title="📦 Quản lý sản phẩm" count={filtered.length}>
        <BtnPrimary onClick={openCreate}>+ Thêm sản phẩm</BtnPrimary>
      </AdminPageHeader>

      {/* Search bar */}
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên, SKU, slug, danh mục..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0f1117] py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition"
          />
          {search && (
            <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs">✕</button>
          )}
        </div>
        {search && (
          <span className="text-xs text-slate-500">
            {filtered.length} kết quả
          </span>
        )}
      </div>

      {/* Detail dialog */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Chi tiết sản phẩm" wide>
        {detail && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>{detail.imageUrl ? <Image src={detail.imageUrl} alt="" width={300} height={300} unoptimized className="w-full rounded-xl object-cover aspect-square" /> : <div className="w-full rounded-xl bg-slate-800 aspect-square flex items-center justify-center text-4xl">📦</div>}</div>
            <div className="md:col-span-2 space-y-3">
              <h2 className="text-xl font-bold text-white">{detail.name}</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-400">SKU:</span> <span className="text-white ml-2">{detail.sku}</span></div>
                <div><span className="text-slate-400">Slug:</span> <span className="text-white ml-2">{detail.slug}</span></div>
                <div><span className="text-slate-400">Giá:</span> <span className="text-cyan-400 ml-2 font-semibold">¥{detail.price.toLocaleString()}</span></div>
                <div><span className="text-slate-400">Sale:</span> <span className="text-amber-400 ml-2">{detail.salePrice ? `¥${detail.salePrice.toLocaleString()}` : "—"}</span></div>
                <div><span className="text-slate-400">Kho:</span> <span className={`ml-2 font-semibold ${detail.stock > 0 ? "text-emerald-400" : "text-red-400"}`}>{detail.stock}</span></div>
                <div><span className="text-slate-400">Danh mục:</span> <span className="text-white ml-2">{detail.categoryName ?? "—"}</span></div>
              </div>
              <div className="flex gap-2 pt-3">
                <BtnAction variant="edit" onClick={() => openEdit(detail)}>✏️ Sửa</BtnAction>
                <BtnAction variant="delete" onClick={() => handleDelete(detail.id)}>🗑️ Xóa</BtnAction>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Form dialog */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "✏️ Sửa sản phẩm" : "➕ Thêm sản phẩm"} wide>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Slug"><Input placeholder="vd: pikachu-vmax" value={form.slug} onChange={(e) => set({ slug: e.target.value })} /></Field>
          <Field label="SKU"><Input placeholder="vd: PKM-001" value={form.sku} onChange={(e) => set({ sku: e.target.value })} /></Field>
          <Field label="Giá (¥)"><Input type="number" value={form.price} onChange={(e) => set({ price: Number(e.target.value) })} /></Field>
          <Field label="Giá sale (¥)"><Input type="number" placeholder="Để trống nếu không sale" value={form.salePrice} onChange={(e) => set({ salePrice: e.target.value })} /></Field>
          <Field label="Tồn kho"><Input type="number" value={form.stock} onChange={(e) => set({ stock: Number(e.target.value) })} /></Field>
          <Field label="Danh mục">
            <Select value={form.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
              <option value="">— Chọn —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.translations[0]?.name ?? c.slug}</option>)}
            </Select>
          </Field>
          <Field label="Tên (日本語)"><Input value={form.nameJa} onChange={(e) => set({ nameJa: e.target.value })} /></Field>
          <Field label="Tên (Tiếng Việt)"><Input value={form.nameVi} onChange={(e) => set({ nameVi: e.target.value })} /></Field>
          <div className="md:col-span-2"><Field label="Mô tả (日本語)"><TextArea rows={3} value={form.descJa} onChange={(e) => set({ descJa: e.target.value })} /></Field></div>
          <div className="md:col-span-2"><Field label="Mô tả (Tiếng Việt)"><TextArea rows={3} value={form.descVi} onChange={(e) => set({ descVi: e.target.value })} /></Field></div>
          <div className="md:col-span-2">
            <FileInput label="Ảnh sản phẩm" onChange={handleUpload} preview={imagePreview} />
            {uploading && <p className="text-xs text-cyan-400 mt-1">Đang tải lên...</p>}
          </div>
          <div className="flex gap-6">
            <Checkbox label="Nổi bật" checked={form.isFeatured} onChange={(v) => set({ isFeatured: v })} />
            <Checkbox label="Hàng mới" checked={form.isNewArrival} onChange={(v) => set({ isNewArrival: v })} />
          </div>
        </div>
        <div className="mt-5 flex gap-3 border-t border-white/[0.06] pt-5">
          <BtnPrimary onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "💾 Lưu"}</BtnPrimary>
          <BtnSecondary onClick={() => setShowForm(false)}>Hủy</BtnSecondary>
        </div>
      </Modal>

      {/* Table */}
      <AdminTable headers={["Ảnh", "Tên", "SKU", "Giá", "Kho", "Danh mục", "Thao tác"]}>
        {paged.map((p) => (
          <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer" onClick={() => setDetail(p)}>
            <td className="px-4 py-3">{p.imageUrl && !p.imageUrl.includes("placehold") ? <Image src={p.imageUrl} alt="" width={40} height={40} unoptimized className="h-10 w-10 rounded-lg object-cover" /> : <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-lg">📦</span>}</td>
            <td className="px-4 py-3 font-medium text-white max-w-[200px] truncate">{p.name}</td>
            <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.sku}</td>
            <td className="px-4 py-3"><span className="text-cyan-400 font-semibold">¥{p.price.toLocaleString()}</span>{p.salePrice ? <span className="ml-1 text-xs text-amber-400">→ ¥{p.salePrice.toLocaleString()}</span> : null}</td>
            <td className="px-4 py-3"><span className={`font-semibold ${p.stock > 0 ? "text-emerald-400" : "text-red-400"}`}>{p.stock}</span></td>
            <td className="px-4 py-3 text-slate-400">{p.categoryName ?? "—"}</td>
            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2">
                <BtnAction variant="edit" onClick={() => openEdit(p)}>Sửa</BtnAction>
                <BtnAction variant="delete" onClick={() => handleDelete(p.id)}>Xóa</BtnAction>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
      {filtered.length === 0 && <EmptyState message={search ? "Không tìm thấy sản phẩm nào" : "Chưa có sản phẩm nào"} />}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Trang {safePage}/{totalPages} · Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={safePage <= 1}
              className="rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
            >«</button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
            >‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 2)
              .map((n, i, arr) => (
                <span key={n}>
                  {i > 0 && arr[i - 1] !== n - 1 && <span className="px-1 text-xs text-slate-600">…</span>}
                  <button
                    onClick={() => setPage(n)}
                    className={`min-w-[2rem] rounded-lg px-2 py-1.5 text-xs font-semibold transition ${n === safePage ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"}`}
                  >{n}</button>
                </span>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
            >›</button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={safePage >= totalPages}
              className="rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
            >»</button>
          </div>
        </div>
      )}
    </div>
  );
}
