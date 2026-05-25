import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { ProductCard, type CatalogProduct } from "../../../../../components/product/ProductCard";
import { SectionHeading } from "../../../../../components/ui/SectionHeading";
import { Link } from "../../../../../i18n/navigation";
import { apiFetch } from "../../../../../lib/api";

export const dynamic = "force-dynamic";

type Props = { params: { locale: string; slug: string } };

export default async function CategoryProductsPage({ params }: Props): Promise<ReactElement> {
  const { locale, slug } = params;
  const t = await getTranslations("common");
  const { data } = await apiFetch<CatalogProduct[]>("products", { params: { locale, categorySlug: slug, limit: 24 } });

  return (
    <div className="space-y-10">
      <div className="glass-panel-strong px-6 py-8 sm:px-10">
        <SectionHeading eyebrow={t("categories")} title={slug.replaceAll("-", " ")} />
        <Link href="/categories" className="mt-2 inline-block text-sm font-semibold text-cyan-400 hover:text-cyan-300">
          ← {t("categories")}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {data.map((p) => (
          <ProductCard key={p.slug} product={p} locale={locale} />
        ))}
      </div>
    </div>
  );
}
