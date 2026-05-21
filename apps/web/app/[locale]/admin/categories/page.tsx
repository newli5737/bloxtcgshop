"use client";
import { type ReactElement, useState, useCallback } from "react";
import { useAdminCrud } from "../../../../lib/hooks/useAdminCrud";
import { adminCategories, type AdminCategory, type CreateCategoryPayload, type UpdateCategoryPayload } from "../../../../lib/fetchers/admin";
import {
  AdminPageHeader, AdminCard, Field, Input,
  BtnPrimary, BtnSecondary, BtnAction, LoadingState, ErrorBanner,
} from "../../../../components/admin/AdminUI";

const categoryActions = {
  list: () => adminCategories.list("ja"),
  create: (d: CreateCategoryPayload) => adminCategories.create(d),
  update: (id: string, d: UpdateCategoryPayload) => adminCategories.update(id, d),
  remove: (id: string) => adminCategories.remove(id),
};

const initForm = { slug: "", nameJa: "", nameVi: "", sortOrder: 0, iconUrl: "", parentId: "" };
type FormState = typeof initForm;

export default function AdminCategoriesPage(): ReactElement {
  const { items, loading, error, saving, create, update, remove } = useAdminCrud(categoryActions);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initForm);

  const set = useCallback((patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch })), []);

  const openCreate = (parentId = "") => {
    setEditId(null); setForm({ ...initForm, parentId }); setShowForm(true);
  };

  const openEdit = (cat: AdminCategory) => {
    setEditId(cat.id);
    setForm({ slug: cat.slug, nameJa: cat.translations.find((t) => t.locale === "ja")?.name ?? "", nameVi: cat.translations.find((t) => t.locale === "vi")?.name ?? "", sortOrder: cat.sortOrder, iconUrl: cat.iconUrl ?? "", parentId: cat.parentId ?? "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    const payload: CreateCategoryPayload = {
      slug: form.slug, sortOrder: form.sortOrder, iconUrl: form.iconUrl || undefined, parentId: form.parentId || undefined,
      translations: [{ locale: "ja", name: form.nameJa }, { locale: "vi", name: form.nameVi || form.nameJa }],
    };
    if (editId) { await update(editId, payload); } else { await create(payload); }
    setShowForm(false); setEditId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa danh mục này và tất cả danh mục con?")) return;
    await remove(id);
  };

  const renderCategory = (cat: AdminCategory, depth = 0): ReactElement => (
    <div key={cat.id}>
      <div className={`group flex items-center justify-between rounded-xl px-4 py-3 transition hover:bg-white/[0.04] ${depth > 0 ? "ml-8" : ""}`}>
        <div className="flex items-center gap-3">
          <span className="text-base">{depth === 0 ? "📁" : "📄"}</span>
          <span className="font-medium text-slate-200">{cat.translations[0]?.name ?? cat.slug}</span>
          <span className="text-xs text-slate-600">({cat.slug})</span>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
          <BtnAction variant="edit" onClick={() => openEdit(cat)}>Sửa</BtnAction>
          <BtnAction variant="view" onClick={() => openCreate(cat.id)}>+ Con</BtnAction>
          <BtnAction variant="delete" onClick={() => handleDelete(cat.id)}>Xóa</BtnAction>
          <span className="text-xs text-slate-500 ml-2">#{cat.sortOrder}</span>
        </div>
      </div>
      {cat.children?.map((child) => renderCategory(child, depth + 1))}
    </div>
  );

  if (loading) return <LoadingState />;

  return (
    <div>
      {error && <ErrorBanner message={error} onDismiss={() => {}} />}

      <AdminPageHeader title="📁 Danh mục" count={items.length}>
        <BtnPrimary onClick={() => openCreate()}>+ Thêm danh mục</BtnPrimary>
      </AdminPageHeader>

      {showForm && (
        <AdminCard className="mb-6">
          <h3 className="mb-5 text-lg font-bold text-white">{editId ? "✏️ Sửa danh mục" : "➕ Thêm danh mục"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Slug"><Input placeholder="vd: booster-packs" value={form.slug} onChange={(e) => set({ slug: e.target.value })} /></Field>
            <Field label="Thứ tự sắp xếp"><Input type="number" value={form.sortOrder} onChange={(e) => set({ sortOrder: Number(e.target.value) })} /></Field>
            <Field label="Tên (日本語)"><Input value={form.nameJa} onChange={(e) => set({ nameJa: e.target.value })} /></Field>
            <Field label="Tên (Tiếng Việt)"><Input value={form.nameVi} onChange={(e) => set({ nameVi: e.target.value })} /></Field>
            <Field label="Icon URL"><Input placeholder="https://..." value={form.iconUrl} onChange={(e) => set({ iconUrl: e.target.value })} /></Field>
          </div>
          <div className="mt-5 flex gap-3">
            <BtnPrimary onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "💾 Lưu"}</BtnPrimary>
            <BtnSecondary onClick={() => setShowForm(false)}>Hủy</BtnSecondary>
          </div>
        </AdminCard>
      )}

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2">
        {items.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">Chưa có danh mục nào</p> : items.map((cat) => renderCategory(cat))}
      </div>
    </div>
  );
}
