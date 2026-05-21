"use client";
import { type ReactElement, useState, useCallback } from "react";
import { useAdminCrud } from "../../../../lib/hooks/useAdminCrud";
import { adminNews, type AdminNews, type CreateNewsPayload, type UpdateNewsPayload } from "../../../../lib/fetchers/admin";
import {
  AdminPageHeader, Modal, AdminTable, Field, Input, TextArea, Checkbox,
  BtnPrimary, BtnSecondary, BtnAction, LoadingState, EmptyState, ErrorBanner,
} from "../../../../components/admin/AdminUI";

const newsActions = {
  list: () => adminNews.list("vi"),
  create: (d: CreateNewsPayload) => adminNews.create(d),
  update: (id: string, d: UpdateNewsPayload) => adminNews.update(id, d),
  remove: (id: string) => adminNews.remove(id),
};

const initForm = { slug: "", isPublished: false, titleJa: "", titleVi: "", contentJa: "", contentVi: "" };
type FormState = typeof initForm;

export default function AdminNewsPage(): ReactElement {
  const { items, loading, error, saving, create, update, remove } = useAdminCrud(newsActions);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminNews | null>(null);
  const [form, setForm] = useState<FormState>(initForm);

  const set = useCallback((patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch })), []);

  const openCreate = () => { setEditId(null); setForm(initForm); setDetail(null); setShowForm(true); };
  const openEdit = (n: AdminNews) => {
    setEditId(n.id);
    const ja = n.translations.find((t) => t.locale === "ja");
    const vi = n.translations.find((t) => t.locale === "vi");
    setForm({
      slug: n.slug, isPublished: n.isPublished,
      titleJa: ja?.title ?? "", titleVi: vi?.title ?? "",
      contentJa: ja?.content ?? "", contentVi: vi?.content ?? "",
    });
    setDetail(null); setShowForm(true);
  };

  const handleSave = async () => {
    const payload: CreateNewsPayload = {
      slug: form.slug, isPublished: form.isPublished,
      translations: [
        { locale: "ja", title: form.titleJa, content: form.contentJa },
        { locale: "vi", title: form.titleVi || form.titleJa, content: form.contentVi || form.contentJa },
      ],
    };
    if (editId) { await update(editId, payload); } else { await create(payload); }
    setShowForm(false); setEditId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bài viết này?")) return;
    await remove(id);
    if (detail?.id === id) setDetail(null);
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      {error && <ErrorBanner message={error} onDismiss={() => {}} />}

      <AdminPageHeader title="📰 Quản lý Tin tức" count={items.length}>
        <BtnPrimary onClick={openCreate}>+ Thêm bài viết</BtnPrimary>
      </AdminPageHeader>

      {/* Detail dialog */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Chi tiết bài viết" wide>
        {detail && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white">{detail.translations[0]?.title ?? detail.slug}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-400">Slug:</span> <span className="text-white ml-2">{detail.slug}</span></div>
              <div><span className="text-slate-400">Trạng thái:</span> <span className="ml-2">{detail.isPublished ? <span className="text-emerald-400">✅ Đã xuất bản</span> : <span className="text-amber-400">📝 Nháp</span>}</span></div>
              <div><span className="text-slate-400">Ngày:</span> <span className="text-white ml-2">{new Date(detail.publishedAt).toLocaleDateString("vi")}</span></div>
            </div>
            {detail.translations.map((t) => (
              <div key={t.locale} className="mt-3 rounded-lg bg-white/[0.03] p-4">
                <p className="text-xs font-semibold text-slate-400 mb-2">{t.locale === "ja" ? "🇯🇵 Tiếng Nhật" : "🇻🇳 Tiếng Việt"}</p>
                <p className="text-sm font-medium text-white mb-1">{t.title}</p>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{t.content}</p>
              </div>
            ))}
            <div className="flex gap-2 pt-3">
              <BtnAction variant="edit" onClick={() => openEdit(detail)}>✏️ Sửa</BtnAction>
              <BtnAction variant="delete" onClick={() => handleDelete(detail.id)}>🗑️ Xóa</BtnAction>
            </div>
          </div>
        )}
      </Modal>

      {/* Form dialog */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "✏️ Sửa bài viết" : "➕ Thêm bài viết"} wide>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Slug"><Input placeholder="vd: new-expansion-release" value={form.slug} onChange={(e) => set({ slug: e.target.value })} /></Field>
          <div className="flex items-end pb-1"><Checkbox label="Xuất bản ngay" checked={form.isPublished} onChange={(v) => set({ isPublished: v })} /></div>
          <Field label="Tiêu đề (日本語)"><Input value={form.titleJa} onChange={(e) => set({ titleJa: e.target.value })} /></Field>
          <Field label="Tiêu đề (Tiếng Việt)"><Input value={form.titleVi} onChange={(e) => set({ titleVi: e.target.value })} /></Field>
          <div className="md:col-span-2"><Field label="Nội dung (日本語)"><TextArea rows={5} value={form.contentJa} onChange={(e) => set({ contentJa: e.target.value })} /></Field></div>
          <div className="md:col-span-2"><Field label="Nội dung (Tiếng Việt)"><TextArea rows={5} value={form.contentVi} onChange={(e) => set({ contentVi: e.target.value })} /></Field></div>
        </div>
        <div className="mt-5 flex gap-3 border-t border-white/[0.06] pt-5">
          <BtnPrimary onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "💾 Lưu"}</BtnPrimary>
          <BtnSecondary onClick={() => setShowForm(false)}>Hủy</BtnSecondary>
        </div>
      </Modal>

      {/* Table */}
      <AdminTable headers={["Tiêu đề", "Slug", "Trạng thái", "Ngày", "Thao tác"]}>
        {items.map((n) => (
          <tr key={n.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer" onClick={() => setDetail(n)}>
            <td className="px-4 py-3 font-medium text-white max-w-[250px] truncate">{n.translations[0]?.title ?? n.slug}</td>
            <td className="px-4 py-3 text-slate-400 font-mono text-xs">{n.slug}</td>
            <td className="px-4 py-3">{n.isPublished ? <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">Đã xuất bản</span> : <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">Nháp</span>}</td>
            <td className="px-4 py-3 text-slate-400">{new Date(n.publishedAt).toLocaleDateString("vi")}</td>
            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2">
                <BtnAction variant="edit" onClick={() => openEdit(n)}>Sửa</BtnAction>
                <BtnAction variant="delete" onClick={() => handleDelete(n.id)}>Xóa</BtnAction>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
      {items.length === 0 && <EmptyState message="Chưa có bài viết nào" />}
    </div>
  );
}
