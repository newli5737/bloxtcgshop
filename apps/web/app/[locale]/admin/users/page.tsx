import type { ReactElement } from "react";

export default function AdminUsersPage(): ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Người dùng</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý tài khoản người dùng</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <span className="text-4xl">👥</span>
        <p className="mt-4 text-sm text-slate-400">Tính năng quản lý người dùng sẽ được cập nhật trong phiên bản tiếp theo.</p>
        <p className="mt-1 text-xs text-slate-600">Hiện tại có thể xem danh sách người dùng qua Swagger API tại <code className="text-cyan-400">/docs</code></p>
      </div>
    </div>
  );
}
