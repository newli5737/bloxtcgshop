"use client";
import { type ReactElement, useState, useEffect, useMemo } from "react";
import {
  AdminPageHeader, AdminTable, BtnAction, LoadingState, EmptyState, ErrorBanner,
} from "../../../../components/admin/AdminUI";
import { apiGet, apiMutate } from "../../../../lib/api";

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  locale: string;
  createdAt: string;
}

const PAGE_SIZE = 20;

export default function AdminUsersPage(): ReactElement {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    apiGet<UserItem[]>("users/admin/all", { limit: 500 })
      .then(setUsers)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((u) =>
      u.email.toLowerCase().includes(q) ||
      (u.name ?? "").toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };

  const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
    try {
      await apiMutate(`users/${userId}/role`, "PATCH", { role: newRole });
      load();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Xóa user ${email}? Hành động này không thể hoàn tác.`)) return;
    try {
      await apiMutate(`users/${userId}`, "DELETE");
      load();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <AdminPageHeader title="👥 Quản lý người dùng" count={filtered.length} />

      {/* Search */}
      <div className="mb-5">
        <div className="relative max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo email, tên, role..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0f1117] py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition"
          />
          {search && (
            <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs">✕</button>
          )}
        </div>
      </div>

      <AdminTable headers={["Email", "Tên", "Role", "Ngôn ngữ", "Ngày tạo", "Thao tác"]}>
        {paged.map((u) => (
          <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
            <td className="px-4 py-3 font-mono text-sm text-white">{u.email}</td>
            <td className="px-4 py-3 text-slate-300">{u.name ?? "—"}</td>
            <td className="px-4 py-3">
              <select
                value={u.role}
                onChange={(e) => handleRoleChange(u.id, e.target.value as "USER" | "ADMIN")}
                className="rounded-lg border border-white/10 bg-[#0f1117] px-2 py-1 text-xs font-semibold text-white focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </td>
            <td className="px-4 py-3 text-slate-400 text-xs uppercase">{u.locale}</td>
            <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString("vi")}</td>
            <td className="px-4 py-3">
              <BtnAction variant="delete" onClick={() => handleDelete(u.id, u.email)}>Xóa</BtnAction>
            </td>
          </tr>
        ))}
      </AdminTable>

      {filtered.length === 0 && <EmptyState message={search ? "Không tìm thấy user nào" : "Chưa có user nào"} />}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">Trang {safePage}/{totalPages}</p>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} className="rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/[0.06] disabled:opacity-30 transition">‹</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className="rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/[0.06] disabled:opacity-30 transition">›</button>
          </div>
        </div>
      )}
    </div>
  );
}
