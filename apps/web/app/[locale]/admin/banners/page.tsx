"use client";
import { type ReactElement, useState, useCallback } from "react";
import { useAdminCrud } from "../../../../lib/hooks/useAdminCrud";
import { adminBanners, adminUpload, type AdminBanner, type CreateBannerPayload, type UpdateBannerPayload } from "../../../../lib/fetchers/admin";
import {
  AdminPageHeader, Modal, Field, Input, Checkbox, FileInput,
  BtnPrimary, BtnSecondary, BtnAction, LoadingState, ErrorBanner, EmptyState,
} from "../../../../components/admin/AdminUI";

const bannerActions = {
  list: () => adminBanners.list("ja"),
  create: (d: CreateBannerPayload) => adminBanners.create(d),
  update: (id: string, d: UpdateBannerPayload) => adminBanners.update(id, d),
  remove: (id: string) => adminBanners.remove(id),
};

const initForm = { imageUrl: "", linkUrl: "", sortOrder: 0, isActive: true, titleJa: "", titleVi: "" };
type FormState = typeof initForm;

export default function AdminBannersPage(): ReactElement {
  const { items, loading, error, saving, create, update, remove } = useAdminCrud(bannerActions);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initForm);
  const [uploading, setUploading] = useState(false);

  const set = useCallback((patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch })), []);

  const openCreate = () => { setEditId(null); setForm(initForm); setShowForm(true); };
  const openEdit = (b: AdminBanner) => {
    setEditId(b.id);
    setForm({
      imageUrl: b.imageUrl, linkUrl: b.linkUrl ?? "", sortOrder: b.sortOrder, isActive: b.isActive,
      titleJa: b.translations.find((t) => t.locale === "ja")?.title ?? "",
      titleVi: b.translations.find((t) => t.locale === "vi")?.title ?? "",
    });
    setShowForm(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const res = await adminUpload.file(file); set({ imageUrl: res.url }); } catch { /* empty */ }
    setUploading(false);
  };

  const handleSave = async () => {
    const payload: CreateBannerPayload = {
      imageUrl: form.imageUrl, linkUrl: form.linkUrl || undefined, sortOrder: form.sortOrder, isActive: form.isActive,
      translations: [{ locale: "ja", title: form.titleJa }, { locale: "vi", title: form.titleVi }],
    };
    if (editId) { await update(editId, payload); } else { await create(payload); }
    setShowForm(false); setEditId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa banner này?")) return;
    await remove(id);
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      {error && <ErrorBanner message={error} onDismiss={() => {}} />}

      <AdminPageHeader title="🖼️ Quản lý Banner" count={items.length}>
        <BtnPrimary onClick={openCreate}>+ Thêm banner</BtnPrimary>
      </AdminPageHeader>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "✏️ Sửa banner" : "➕ Thêm banner"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FileInput label="Ảnh banner" onChange={handleUpload} preview={form.imageUrl || null} />
            {uploading && <p className="text-xs text-cyan-400 mt-1">Đang tải lên...</p>}
          </div>
          <Field label="Link URL"><Input placeholder="https://..." value={form.linkUrl} onChange={(e) => set({ linkUrl: e.target.value })} /></Field>
          <Field label="Thứ tự"><Input type="number" value={form.sortOrder} onChange={(e) => set({ sortOrder: Number(e.target.value) })} /></Field>
          <Field label="Tiêu đề (日本語)"><Input value={form.titleJa} onChange={(e) => set({ titleJa: e.target.value })} /></Field>
          <Field label="Tiêu đề (Tiếng Việt)"><Input value={form.titleVi} onChange={(e) => set({ titleVi: e.target.value })} /></Field>
          <Checkbox label="Đang hiển thị" checked={form.isActive} onChange={(v) => set({ isActive: v })} />
        </div>
        <div className="mt-5 flex gap-3 border-t border-white/[0.06] pt-5">
          <BtnPrimary onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "💾 Lưu"}</BtnPrimary>
          <BtnSecondary onClick={() => setShowForm(false)}>Hủy</BtnSecondary>
        </div>
      </Modal>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((b) => (
          <div key={b.id} className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-[#13151d] transition hover:border-white/10">
            <img src={b.imageUrl} alt="" className="h-40 w-full object-cover" />
            <div className="p-4">
              <p className="text-sm font-medium text-white">{b.translations[0]?.title ?? "Banner"}</p>
              <p className="mt-1 text-xs text-slate-400">Thứ tự: {b.sortOrder} | {b.isActive ? "✅ Hiển thị" : "❌ Ẩn"}</p>
              <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <BtnAction variant="edit" onClick={() => openEdit(b)}>Sửa</BtnAction>
                <BtnAction variant="delete" onClick={() => handleDelete(b.id)}>Xóa</BtnAction>
              </div>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <EmptyState message="Chưa có banner nào" />}
    </div>
  );
}
