"use client";
import { type ReactElement, useState, useEffect, useCallback } from "react";
import {
  AdminPageHeader, Modal, Field, Input, TextArea, AdminTable,
  BtnPrimary, BtnSecondary, BtnAction, LoadingState, EmptyState, ErrorBanner, Select,
} from "../../../../components/admin/AdminUI";
import { apiGet, apiMutate } from "../../../../lib/api";

interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  prizeDescription: string | null;
  imageUrl: string | null;
  status: string;
  maxParticipants: number;
  winningNumber: number | null;
  drawDate: string | null;
  drawnAt: string | null;
  _count: { registrations: number };
}

interface Registration {
  id: string;
  luckyNumber: number;
  isWinner: boolean;
  createdAt: string;
  user: { id: string; email: string; name: string | null };
}

const statusLabels: Record<string, string> = {
  UPCOMING: "⏳ Sắp diễn ra", OPEN: "✅ Đang mở", CLOSED: "🔒 Đã đóng", DRAWN: "🎲 Đã quay", CANCELLED: "❌ Đã hủy",
};
const statusColors: Record<string, string> = {
  UPCOMING: "bg-amber-500/10 text-amber-400", OPEN: "bg-emerald-500/10 text-emerald-400",
  CLOSED: "bg-slate-500/10 text-slate-400", DRAWN: "bg-cyan-500/10 text-cyan-300", CANCELLED: "bg-red-500/10 text-red-400",
};

const initForm = { slug: "", title: "", description: "", prizeDescription: "", maxParticipants: 100, drawDate: "" };
type FormState = typeof initForm;

export default function AdminEventsPage(): ReactElement {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initForm);
  const set = useCallback((patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch })), []);

  // Detail modal
  const [detailEvent, setDetailEvent] = useState<EventItem | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  // Draw modal
  const [showDraw, setShowDraw] = useState(false);
  const [drawEventId, setDrawEventId] = useState<string | null>(null);
  const [drawNumbers, setDrawNumbers] = useState("");
  const [emailLang, setEmailLang] = useState<"ja" | "en">("ja");
  const [drawing, setDrawing] = useState(false);

  const reload = () => {
    setLoading(true);
    apiGet<EventItem[]>("events")
      .then(setEvents)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const openCreate = () => {
    setEditId(null); setForm(initForm); setShowForm(true);
  };

  const openEdit = (ev: EventItem) => {
    setEditId(ev.id);
    setForm({
      slug: ev.slug, title: ev.title, description: ev.description ?? "",
      prizeDescription: ev.prizeDescription ?? "", maxParticipants: ev.maxParticipants,
      drawDate: ev.drawDate ? ev.drawDate.slice(0, 10) : "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        slug: form.slug, title: form.title, description: form.description || undefined,
        prizeDescription: form.prizeDescription || undefined, maxParticipants: form.maxParticipants,
        drawDate: form.drawDate || undefined,
      };
      if (editId) { await apiMutate(`events/${editId}`, "PATCH", payload); }
      else { await apiMutate("events", "POST", payload); }
      setShowForm(false); reload();
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa sự kiện này?")) return;
    await apiMutate(`events/${id}`, "DELETE");
    reload();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await apiMutate(`events/${id}`, "PATCH", { status });
    reload();
  };

  const openDetail = async (ev: EventItem) => {
    setDetailEvent(ev);
    setLoadingRegs(true);
    try {
      const regs = await apiGet<Registration[]>(`events/${ev.id}/registrations`);
      setRegistrations(regs);
    } catch { setRegistrations([]); }
    setLoadingRegs(false);
  };

  const openDraw = (ev: EventItem) => {
    setDrawEventId(ev.id); setDrawNumbers(""); setEmailLang("ja"); setShowDraw(true);
  };

  const handleDraw = async () => {
    if (!drawEventId) return;
    const numbers = drawNumbers.split(/[,\s]+/).map(Number).filter((n) => n > 0);
    if (numbers.length === 0) { alert("Nhập ít nhất 1 số trúng!"); return; }
    if (!confirm(`Xác nhận quay số: ${numbers.join(", ")}. Gửi email bằng ${emailLang === "ja" ? "tiếng Nhật" : "tiếng Anh"}?`)) return;
    setDrawing(true);
    try {
      const result = await apiMutate<{ winningNumbers: number[]; winners: Array<{ luckyNumber: number; email: string; name: string | null }>; emailsSent: number }>(
        `events/${drawEventId}/draw`, "POST", { winningNumbers: numbers, emailLang }
      );
      alert(`🎉 Đã quay số thành công!\n\nSố trúng: ${result.winningNumbers.join(", ")}\nSố email đã gửi: ${result.emailsSent}\n\nNgười thắng:\n${result.winners.map((w) => `#${w.luckyNumber} — ${w.email} (${w.name ?? "N/A"})`).join("\n")}`);
      setShowDraw(false); reload();
    } catch (e) { alert((e as Error).message); }
    finally { setDrawing(false); }
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <AdminPageHeader title="🎉 Quản lý Sự kiện" count={events.length}>
        <BtnPrimary onClick={openCreate}>+ Thêm sự kiện</BtnPrimary>
      </AdminPageHeader>

      {/* Detail Modal */}
      <Modal open={!!detailEvent} onClose={() => setDetailEvent(null)} title="📋 Chi tiết sự kiện" wide>
        {detailEvent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-400">Tên:</span> <span className="text-white font-semibold ml-1">{detailEvent.title}</span></div>
              <div><span className="text-slate-400">Trạng thái:</span> <span className={`ml-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColors[detailEvent.status] ?? ""}`}>{statusLabels[detailEvent.status] ?? detailEvent.status}</span></div>
              <div><span className="text-slate-400">Người tham gia:</span> <span className="text-white ml-1">{detailEvent._count.registrations}/{detailEvent.maxParticipants}</span></div>
              {detailEvent.winningNumber != null && <div><span className="text-slate-400">Số trúng:</span> <span className="text-amber-400 font-bold ml-1">#{detailEvent.winningNumber}</span></div>}
            </div>

            <h3 className="text-sm font-semibold text-slate-300 border-t border-white/[0.06] pt-4">Danh sách đăng ký ({registrations.length})</h3>
            {loadingRegs ? <p className="text-sm text-slate-500">Đang tải...</p> : registrations.length === 0 ? <p className="text-sm text-slate-500">Chưa có ai đăng ký</p> : (
              <div className="max-h-80 overflow-y-auto rounded-xl border border-white/[0.06]">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#0f1117]">
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-3 py-2 text-slate-400">Số</th>
                      <th className="px-3 py-2 text-slate-400">Email</th>
                      <th className="px-3 py-2 text-slate-400">Tên</th>
                      <th className="px-3 py-2 text-slate-400">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {registrations.map((r) => (
                      <tr key={r.id} className={r.isWinner ? "bg-amber-500/5" : ""}>
                        <td className="px-3 py-2 font-mono font-bold text-amber-400">#{r.luckyNumber}</td>
                        <td className="px-3 py-2 text-white">{r.user.email}</td>
                        <td className="px-3 py-2 text-slate-300">{r.user.name ?? "—"}</td>
                        <td className="px-3 py-2">{r.isWinner ? <span className="text-emerald-400 font-bold">🏆 Thắng</span> : <span className="text-slate-500">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "✏️ Sửa sự kiện" : "➕ Thêm sự kiện"} wide>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Slug"><Input placeholder="vd: pokemon-giveaway-jan" value={form.slug} onChange={(e) => set({ slug: e.target.value })} /></Field>
          <Field label="Tên sự kiện"><Input value={form.title} onChange={(e) => set({ title: e.target.value })} /></Field>
          <Field label="Số người tối đa"><Input type="number" value={form.maxParticipants} onChange={(e) => set({ maxParticipants: Number(e.target.value) })} /></Field>
          <Field label="Ngày quay"><Input type="date" value={form.drawDate} onChange={(e) => set({ drawDate: e.target.value })} /></Field>
          <div className="md:col-span-2"><Field label="Mô tả"><TextArea rows={3} value={form.description} onChange={(e) => set({ description: e.target.value })} /></Field></div>
          <div className="md:col-span-2"><Field label="Mô tả giải thưởng"><TextArea rows={3} value={form.prizeDescription} onChange={(e) => set({ prizeDescription: e.target.value })} /></Field></div>
        </div>
        <div className="mt-5 flex gap-3 border-t border-white/[0.06] pt-5">
          <BtnPrimary onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "💾 Lưu"}</BtnPrimary>
          <BtnSecondary onClick={() => setShowForm(false)}>Hủy</BtnSecondary>
        </div>
      </Modal>

      {/* Draw Modal */}
      <Modal open={showDraw} onClose={() => setShowDraw(false)} title="🎲 Quay số trúng thưởng">
        <div className="space-y-4">
          <Field label="Nhập các số trúng (cách nhau bằng dấu phẩy)">
            <Input placeholder="vd: 7, 13, 42" value={drawNumbers} onChange={(e) => setDrawNumbers(e.target.value)} />
          </Field>
          <Field label="Ngôn ngữ email thông báo">
            <Select value={emailLang} onChange={(e) => setEmailLang(e.target.value as "ja" | "en")}>
              <option value="ja">🇯🇵 Tiếng Nhật</option>
              <option value="en">🇬🇧 Tiếng Anh</option>
            </Select>
          </Field>
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 text-sm text-amber-300">
            ⚠️ Sau khi xác nhận, hệ thống sẽ:<br />
            1. Đánh dấu người thắng<br />
            2. Gửi email xác nhận cho từng người thắng<br />
            3. Đổi trạng thái sự kiện sang &quot;Đã quay&quot;
          </div>
        </div>
        <div className="mt-5 flex gap-3 border-t border-white/[0.06] pt-5">
          <BtnPrimary onClick={handleDraw} disabled={drawing}>{drawing ? "Đang quay..." : "🎲 Xác nhận quay số"}</BtnPrimary>
          <BtnSecondary onClick={() => setShowDraw(false)}>Hủy</BtnSecondary>
        </div>
      </Modal>

      {/* Events table */}
      <AdminTable headers={["Tên sự kiện", "Trạng thái", "Người tham gia", "Số trúng", "Thao tác"]}>
        {events.map((ev) => (
          <tr key={ev.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer" onClick={() => openDetail(ev)}>
            <td className="px-4 py-3">
              <div className="font-medium text-white">{ev.title}</div>
              <div className="text-xs text-slate-600">{ev.slug}</div>
            </td>
            <td className="px-4 py-3">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColors[ev.status] ?? ""}`}>{statusLabels[ev.status] ?? ev.status}</span>
            </td>
            <td className="px-4 py-3 text-slate-300">{ev._count.registrations}/{ev.maxParticipants}</td>
            <td className="px-4 py-3">{ev.winningNumber != null ? <span className="font-bold text-amber-400">#{ev.winningNumber}</span> : <span className="text-slate-600">—</span>}</td>
            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-wrap gap-1.5">
                <BtnAction variant="edit" onClick={() => openEdit(ev)}>Sửa</BtnAction>
                {(ev.status === "UPCOMING") && <BtnAction variant="view" onClick={() => handleStatusChange(ev.id, "OPEN")}>Mở</BtnAction>}
                {(ev.status === "OPEN") && <BtnAction variant="view" onClick={() => handleStatusChange(ev.id, "CLOSED")}>Đóng</BtnAction>}
                {(ev.status === "OPEN" || ev.status === "CLOSED") && <BtnAction variant="view" onClick={() => openDraw(ev)}>🎲 Quay</BtnAction>}
                <BtnAction variant="delete" onClick={() => handleDelete(ev.id)}>Xóa</BtnAction>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
      {events.length === 0 && <EmptyState message="Chưa có sự kiện nào" />}
    </div>
  );
}
