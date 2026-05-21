"use client";
import { type ReactElement, useState, useMemo, useCallback } from "react";
import { useAdminCrud } from "../../../../lib/hooks/useAdminCrud";
import {
  adminProducts, adminCategories, adminUpload,
  type AdminProduct, type AdminCategory, type CreateProductPayload, type UpdateProductPayload,
} from "../../../../lib/fetchers/admin";
import {
  AdminPageHeader, Modal, AdminTable, Field, Input, TextArea, Select, Checkbox, FileInput,
  BtnPrimary, BtnSecondary, BtnAction, LoadingState, EmptyState, ErrorBanner,
} from "../../../../components/admin/AdminUI";

// ─── Actions (stable references) ───
const productActions = {
  list: () => adminProducts.list("ja"),
  create: (d: CreateProductPayload) => adminProducts.create(d),
  update: (id: string, d: UpdateProductPayload) => adminProducts.update(id, d),
  remove: (id: string) => adminProducts.remove(id),
};

const initForm = { slug: "", sku: "", price: 0, salePrice: "", stock: 0, nameJa: "", nameVi: "", descJa: "", descVi: "", categoryId: "", isFeatured: false, isNewArrival: false };
type FormState = typeof initForm;

export default function AdminProductsPage(): ReactElement {
  const { items, loading, error, saving, create, update, remove } = useAdminCrud(productActions);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<FormState>(initForm);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load categories once
  useMemo(() => { adminCategories.list("ja").then(setCategories).catch(() => {}); }, []);

  const set = useCallback((patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch })), []);

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
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      categoryId: form.categoryId || undefined, isFeatured: form.isFeatured, isNewArrival: form.isNewArrival,
      translations: [
        { locale: "ja", name: form.nameJa, description: form.descJa },
        { locale: "vi", name: form.nameVi || form.nameJa, description: form.descVi || form.descJa },
      ],
    };
    if (editId) { await update(editId, payload); } else { await create(payload); }
    setShowForm(false); setEditId(null);
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

      <AdminPageHeader title="📦 Quản lý sản phẩm" count={items.length}>
        <BtnPrimary onClick={openCreate}>+ Thêm sản phẩm</BtnPrimary>
      </AdminPageHeader>

      {/* Detail dialog */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Chi tiết sản phẩm" wide>
        {detail && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>{detail.imageUrl ? <img src={detail.imageUrl} alt="" className="w-full rounded-xl object-cover aspect-square" /> : <div className="w-full rounded-xl bg-slate-800 aspect-square flex items-center justify-center text-4xl">📦</div>}</div>
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
        {items.map((p) => (
          <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer" onClick={() => setDetail(p)}>
            <td className="px-4 py-3">{p.imageUrl ? <img src={p.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-lg">📦</span>}</td>
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
      {items.length === 0 && <EmptyState message="Chưa có sản phẩm nào" />}
    </div>
  );
}
