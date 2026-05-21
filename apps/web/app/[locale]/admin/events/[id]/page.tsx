"use client";

import { useState, useEffect, type ReactElement } from "react";

type Registration = {
  id: string;
  luckyNumber: number;
  isWinner: boolean;
  createdAt: string;
  user: { id: string; email: string; name: string | null };
};

type EventDetail = {
  id: string;
  title: string;
  status: string;
  winningNumber: number | null;
  maxParticipants: number;
};

export default function AdminEventDetailPage({ params }: { params: { id: string } }): ReactElement {
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3041/v1";

  useEffect(() => {
    // Fetch event info and registrations
    fetch(`${apiBase}/events/${params.id}/registrations`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => setRegistrations(json.data ?? []))
      .catch(() => {});
  }, [apiBase, params.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Chi tiết sự kiện</h1>
        <p className="mt-1 text-sm text-slate-500">ID: {params.id}</p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] p-6">
        <h2 className="font-display text-lg font-bold text-white">Danh sách đăng ký ({registrations.length})</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.06]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-400">#</th>
                <th className="px-4 py-3 font-semibold text-slate-400">Số may mắn</th>
                <th className="px-4 py-3 font-semibold text-slate-400">Người dùng</th>
                <th className="px-4 py-3 font-semibold text-slate-400">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-400">Ngày đăng ký</th>
                <th className="px-4 py-3 font-semibold text-slate-400">Kết quả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {registrations.map((reg, i) => (
                <tr key={reg.id} className={`transition hover:bg-white/[0.03] ${reg.isWinner ? "bg-amber-500/5" : ""}`}>
                  <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className={`font-display text-lg font-bold ${reg.isWinner ? "text-amber-400" : "text-cyan-400"}`}>
                      #{reg.luckyNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-200">{reg.user.name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{reg.user.email}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(reg.createdAt).toLocaleDateString("vi")}</td>
                  <td className="px-4 py-3">
                    {reg.isWinner ? (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">🏆 TRÚNG THƯỞNG</span>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
