/**
 * Shared admin UI primitives — form fields, table shell, action buttons.
 * All admin pages reuse these instead of duplicating styles.
 */
import type { ReactElement, ReactNode, ChangeEvent } from "react";
import Image from "next/image";

// ─── Layout ───
export function AdminPageHeader({ title, count, children }: { title: string; count?: number; children?: ReactNode }): ReactElement {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {count !== undefined && <p className="mt-0.5 text-xs text-slate-500">{count} mục</p>}
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }): ReactElement {
  return <div className={`rounded-2xl border border-white/10 bg-[#1a1d2e] p-6 ${className}`}>{children}</div>;
}

// ─── Modal Dialog ───
export function Modal({ open, onClose, title, children, wide, zIndex }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean; zIndex?: number }): ReactElement | null {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-start justify-center pt-[5vh] pb-[5vh]" style={{ zIndex: zIndex ?? 50 }} onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      {/* Dialog */}
      <div
        className={`relative z-10 flex max-h-[90vh] flex-col rounded-2xl border border-white/10 bg-[#161829] shadow-2xl shadow-black/50 ${wide ? "w-full max-w-3xl" : "w-full max-w-2xl"}`}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn 0.2s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white transition">✕</button>
        </div>
        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
      <style>{`@keyframes modalIn { from { opacity: 0; transform: translateY(-16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
    </div>
  );
}

// ─── Form ───
const inputBase = "w-full rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition";

export function Field({ label, children }: { label: string; children: ReactNode }): ReactElement {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>): ReactElement {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>): ReactElement {
  return <textarea {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>): ReactElement {
  return <select {...props} className={`${inputBase} ${props.className ?? ""}`}>{children}</select>;
}

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }): ReactElement {
  return (
    <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-cyan-500" />
      {label}
    </label>
  );
}

export function FileInput({ label, onChange, preview }: { label: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; preview?: string | null }): ReactElement {
  return (
    <Field label={label}>
      <input type="file" accept="image/*" onChange={onChange} className="text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-600/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-cyan-400 file:cursor-pointer" />
      {preview && <Image src={preview} alt="" width={80} height={80} unoptimized className="mt-2 h-20 w-auto rounded-lg object-cover" />}
    </Field>
  );
}

// ─── Buttons ───
export function BtnPrimary({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>): ReactElement {
  return <button {...props} className={`rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-500 transition disabled:opacity-50 ${props.className ?? ""}`}>{children}</button>;
}

export function BtnSecondary({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>): ReactElement {
  return <button {...props} className={`rounded-lg bg-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-600 transition ${props.className ?? ""}`}>{children}</button>;
}

export function BtnAction({ variant, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant: "edit" | "delete" | "view" }): ReactElement {
  const colors = {
    edit: "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20",
    delete: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
    view: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
  };
  return <button {...props} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${colors[variant]} ${props.className ?? ""}`}>{children}</button>;
}

// ─── Table ───
export function AdminTable({ headers, children }: { headers: string[]; children: ReactNode }): ReactElement {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#13151d]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] text-slate-400">
            {headers.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// ─── State indicators ───
export function LoadingState(): ReactElement {
  return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" /></div>;
}

export function EmptyState({ message }: { message: string }): ReactElement {
  return <p className="py-12 text-center text-sm text-slate-500">{message}</p>;
}

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }): ReactElement {
  return (
    <div className="mb-4 flex items-center justify-between rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
      <span>⚠️ {message}</span>
      <button onClick={onDismiss} className="text-red-300 hover:text-white">✕</button>
    </div>
  );
}
