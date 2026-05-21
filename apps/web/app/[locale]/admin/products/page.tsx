import type { ReactElement } from "react";
import { apiFetch } from "../../../../lib/api";

type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  price: number;
  salePrice: number | null;
  stock: number;
  status: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  imageUrl: string | null;
};

export default async function AdminProductsPage(): Promise<ReactElement> {
  let products: Product[] = [];
  try {
    const res = await apiFetch<Product[]>("products", { params: { limit: 50, locale: "ja" } });
    products = res.data;
  } catch { /* empty */ }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Sản phẩm</h1>
          <p className="mt-1 text-sm text-slate-500">{products.length} sản phẩm</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] bg-white/[0.03]">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-400">Hình</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Tên</th>
              <th className="px-4 py-3 font-semibold text-slate-400">SKU</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Giá (¥)</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Kho</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {products.map((p) => (
              <tr key={p.id} className="transition hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt="" className="h-10 w-8 rounded-md object-cover" />
                  ) : (
                    <div className="h-10 w-8 rounded-md bg-surface-300" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-slate-200">{p.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.sku}</td>
                <td className="px-4 py-3 text-cyan-400">¥{Number(p.price).toLocaleString()}{p.salePrice ? <span className="ml-1 text-xs text-red-400">→ ¥{Number(p.salePrice).toLocaleString()}</span> : null}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${p.stock > 5 ? "text-emerald-400" : p.stock > 0 ? "text-amber-400" : "text-red-400"}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
