"use client";
import { type ReactElement, useState, useCallback } from "react";
import Image from "next/image";
import { useAdminCrud } from "../../../../lib/hooks/useAdminCrud";
import { adminCategories, adminUpload, type AdminCategory, type CreateCategoryPayload, type UpdateCategoryPayload } from "../../../../lib/fetchers/admin";
import {
  AdminPageHeader, Modal, Field, Input, FileInput,
  BtnPrimary, BtnSecondary, BtnAction, LoadingState, ErrorBanner,
} from "../../../../components/admin/AdminUI";

const categoryActions = {
  list: () => adminCategories.list("ja"),
  create: (d: CreateCategoryPayload) => adminCategories.create(d),
  update: (id: string, d: UpdateCategoryPayload) => adminCategories.update(id, d),
  remove: (id: string) => adminCategories.remove(id),
};

const initForm = { slug: "", nameJa: "", nameEn: "", nameVi: "", sortOrder: 0, iconUrl: "", parentId: "" };
type FormState = typeof initForm;

// Tab type for icon source
type IconMode = "emoji" | "upload" | "url";

const EMOJI_OPTIONS = ["📦", "🃏", "⚔️", "🏆", "🎴", "🎁", "🛡️", "⭐", "🔥", "💎", "🌟", "🎯", "🎲", "🧩", "📁"];

export default function AdminCategoriesPage(): ReactElement {
  const { items, loading, error, saving, create, update, remove } = useAdminCrud(categoryActions);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initForm);
  const [iconMode, setIconMode] = useState<IconMode>("emoji");
  const [uploading, setUploading] = useState(false);

  const set = useCallback((patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch })), []);

  const openCreate = (parentId = "") => {
    setEditId(null); setForm({ ...initForm, parentId }); setIconMode("emoji"); setShowForm(true);
  };

  const openEdit = (cat: AdminCategory) => {
    setEditId(cat.id);
    const jaName = cat.translations.find((t) => t.locale === "ja")?.name ?? "";
    const enName = cat.translations.find((t) => t.locale === "en")?.name ?? "";
    const viName = cat.translations.find((t) => t.locale === "vi")?.name ?? "";
    setForm({ slug: cat.slug, nameJa: jaName, nameEn: enName, nameVi: viName, sortOrder: cat.sortOrder, iconUrl: cat.iconUrl ?? "", parentId: cat.parentId ?? "" });
    // Detect icon mode from existing URL
    if (cat.iconUrl && cat.iconUrl.startsWith("http")) setIconMode("upload");
    else setIconMode("emoji");
    setShowForm(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const res = await adminUpload.file(file); set({ iconUrl: res.url }); } catch { /* empty */ }
    setUploading(false);
  };

  const handleSave = async () => {
    const payload: CreateCategoryPayload = {
      slug: form.slug, sortOrder: form.sortOrder, iconUrl: form.iconUrl || undefined, parentId: form.parentId || undefined,
      translations: [
        { locale: "ja", name: form.nameJa },
        { locale: "en", name: form.nameEn || form.nameJa },
        { locale: "vi", name: form.nameVi || form.nameJa },
      ],
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
          {cat.iconUrl && cat.iconUrl.startsWith("http") ? (
            <Image src={cat.iconUrl} alt="" width={24} height={24} unoptimized className="h-6 w-6 rounded object-cover" />
          ) : (
            <span className="text-base">{cat.iconUrl || (depth === 0 ? "📁" : "📄")}</span>
          )}
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

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "✏️ Sửa danh mục" : "➕ Thêm danh mục"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Slug"><Input placeholder="vd: booster-packs" value={form.slug} onChange={(e) => set({ slug: e.target.value })} /></Field>
          <Field label="Thứ tự sắp xếp"><Input type="number" value={form.sortOrder} onChange={(e) => set({ sortOrder: Number(e.target.value) })} /></Field>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Tên (日本語)"><Input value={form.nameJa} onChange={(e) => set({ nameJa: e.target.value })} /></Field>
            <Field label="Tên (English)"><Input value={form.nameEn} onChange={(e) => set({ nameEn: e.target.value })} /></Field>
            <Field label="Tên (Tiếng Việt)"><Input value={form.nameVi} onChange={(e) => set({ nameVi: e.target.value })} /></Field>
          </div>

          {/* Icon selector */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Icon danh mục</label>
            {/* Mode tabs */}
            <div className="mb-3 flex gap-1 rounded-lg bg-white/[0.04] p-1 w-fit">
              {([["emoji", "Emoji"], ["upload", "Upload ảnh"], ["url", "URL"]] as [IconMode, string][]).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setIconMode(mode)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${iconMode === mode ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                >{label}</button>
              ))}
            </div>

            {iconMode === "emoji" && (
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => set({ iconUrl: emoji })}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl transition ${form.iconUrl === emoji ? "bg-cyan-600/30 ring-2 ring-cyan-500 scale-110" : "bg-white/[0.04] hover:bg-white/[0.08]"}`}
                  >{emoji}</button>
                ))}
              </div>
            )}

            {iconMode === "upload" && (
              <div className="flex items-center gap-4">
                <FileInput label="" onChange={handleUpload} preview={form.iconUrl.startsWith("http") ? form.iconUrl : null} />
                {uploading && <span className="text-xs text-cyan-400">Đang tải...</span>}
              </div>
            )}

            {iconMode === "url" && (
              <Input placeholder="https://example.com/icon.png" value={form.iconUrl} onChange={(e) => set({ iconUrl: e.target.value })} />
            )}

            {/* Preview */}
            {form.iconUrl && (
              <div className="mt-3 flex items-center gap-3 rounded-lg bg-white/[0.04] px-4 py-2">
                <span className="text-xs text-slate-500">Preview:</span>
                {form.iconUrl.startsWith("http") ? (
                  <Image src={form.iconUrl} alt="" width={32} height={32} unoptimized className="h-8 w-8 rounded object-cover" />
                ) : (
                  <span className="text-2xl">{form.iconUrl}</span>
                )}
                <button type="button" onClick={() => set({ iconUrl: "" })} className="ml-auto text-xs text-red-400 hover:text-red-300">✕ Xóa</button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 flex gap-3 border-t border-white/[0.06] pt-5">
          <BtnPrimary onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "💾 Lưu"}</BtnPrimary>
          <BtnSecondary onClick={() => setShowForm(false)}>Hủy</BtnSecondary>
        </div>
      </Modal>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2">
        {items.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">Chưa có danh mục nào</p> : items.map((cat) => renderCategory(cat))}
      </div>
    </div>
  );
}
