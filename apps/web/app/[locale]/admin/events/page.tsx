"use client";

import { useState, useEffect, type ReactElement } from "react";

type EventItem = {
  id: string;
  slug: string;
  title: string;
  status: string;
  maxParticipants: number;
  winningNumber: number | null;
  drawDate: string | null;
  drawnAt: string | null;
  _count: { registrations: number };
};

const statusLabels: Record<string, string> = {
  UPCOMING: "Sắp diễn ra",
  OPEN: "Đang mở",
  CLOSED: "Đã đóng",
  DRAWN: "Đã quay",
  CANCELLED: "Đã huỷ",
};

const statusColors: Record<string, string> = {
  UPCOMING: "bg-amber-500/10 text-amber-400",
  OPEN: "bg-emerald-500/10 text-emerald-400",
  CLOSED: "bg-slate-500/10 text-slate-400",
  DRAWN: "bg-cyan-500/10 text-cyan-300",
  CANCELLED: "bg-red-500/10 text-red-400",
};

export default function AdminEventsPage(): ReactElement {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [drawing, setDrawing] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3041/v1";

  useEffect(() => {
    fetch(`${apiBase}/events`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => setEvents(json.data ?? []))
      .catch(() => {});
  }, [apiBase]);

  const handleDraw = async (eventId: string): Promise<void> => {
    if (!confirm("Bạn chắc chắn muốn quay số cho sự kiện này?")) return;
    setDrawing(eventId);
    try {
      const res = await fetch(`${apiBase}/events/${eventId}/draw`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok) {
        alert(`🎉 Số trúng thưởng: #${json.data.winningNumber}`);
        // Reload events
        const eventsRes = await fetch(`${apiBase}/events`, { credentials: "include" });
        const eventsJson = await eventsRes.json();
        setEvents(eventsJson.data ?? []);
      } else {
        alert(json?.error?.message ?? "Lỗi khi quay số");
      }
    } catch {
      alert("Lỗi kết nối");
    } finally {
      setDrawing(null);
    }
  };

  const handleStatusChange = async (eventId: string, status: string): Promise<void> => {
    try {
      await fetch(`${apiBase}/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const eventsRes = await fetch(`${apiBase}/events`, { credentials: "include" });
      const eventsJson = await eventsRes.json();
      setEvents(eventsJson.data ?? []);
    } catch {
      alert("Lỗi cập nhật");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Sự kiện</h1>
          <p className="mt-1 text-sm text-slate-500">{events.length} sự kiện</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] bg-white/[0.03]">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-400">Tên sự kiện</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Trạng thái</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Người tham gia</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Số trúng</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {events.map((ev) => (
              <tr key={ev.id} className="transition hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-200">{ev.title}</div>
                  <div className="text-xs text-slate-600">{ev.slug}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusColors[ev.status] ?? ""}`}>
                    {statusLabels[ev.status] ?? ev.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {ev._count.registrations}/{ev.maxParticipants}
                </td>
                <td className="px-4 py-3">
                  {ev.winningNumber != null ? (
                    <span className="font-bold text-amber-400">#{ev.winningNumber}</span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {ev.status === "UPCOMING" ? (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(ev.id, "OPEN")}
                        className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                      >
                        Mở đăng ký
                      </button>
                    ) : null}
                    {ev.status === "OPEN" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(ev.id, "CLOSED")}
                          className="rounded-lg bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-500/20"
                        >
                          Đóng đăng ký
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDraw(ev.id)}
                          disabled={drawing === ev.id}
                          className="rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
                        >
                          {drawing === ev.id ? "Đang quay..." : "🎲 Quay số"}
                        </button>
                      </>
                    ) : null}
                    {ev.status === "CLOSED" ? (
                      <button
                        type="button"
                        onClick={() => handleDraw(ev.id)}
                        disabled={drawing === ev.id}
                        className="rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
                      >
                        {drawing === ev.id ? "Đang quay..." : "🎲 Quay số"}
                      </button>
                    ) : null}
                    <a
                      href={`events/${ev.id}`}
                      className="rounded-lg bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
                    >
                      Chi tiết
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
