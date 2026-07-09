"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, PackageMinus } from "lucide-react";
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  slugify,
  formatPrice,
} from "@/lib/firestore";
import { adjustProductStock } from "@/lib/inventory";
import { useAuth } from "@/context/AuthContext";
import StockInboundButton from "@/components/admin/StockInboundButton";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataTable from "@/components/admin/AdminDataTable";
import { matchesSearch } from "@/lib/search";
import type { Product, Category } from "@/lib/types";
import { calculateSellingPrice } from "@/lib/pricing";
import Button from "@/components/ui/Button";
import ProductFormPanel, {
  emptyProductForm,
  type ProductFormState,
} from "@/components/admin/ProductFormPanel";
import { syncProductAggregates } from "@/lib/product-variants";

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  const [saving, setSaving] = useState(false);
  const [stockAdjust, setStockAdjust] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        matchesSearch(search, [
          p.name,
          p.description,
          p.slug,
          categoryMap.get(p.categoryId),
          p.stock,
          formatPrice(p.price),
        ])
      ),
    [products, search, categoryMap]
  );

  const load = async () => {
    const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
    setProducts(prods);
    setCategories(cats);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const cost = parseFloat(form.costPrice) || 0;
      const markupPercent = parseFloat(form.markupPercent) || 0;
      const markupFixed = parseFloat(form.markupFixed) || 0;
      const variants = form.hasVariants
        ? form.variants.map((variant, index) => ({
            ...variant,
            sortOrder: index,
            imageUrl: variant.imageUrl || undefined,
          }))
        : [];

      const aggregates =
        form.hasVariants && variants.length > 0
          ? syncProductAggregates(variants)
          : {
              price:
                form.priceMode === "calculated" && cost > 0
                  ? calculateSellingPrice(cost, markupPercent, markupFixed)
                  : parseFloat(form.price),
              stock: parseInt(form.stock, 10) || 0,
            };

      const data = {
        name: form.name,
        slug: slugify(form.name),
        description: form.description,
        price: aggregates.price,
        costPrice: cost || undefined,
        markupPercent: markupPercent || undefined,
        markupFixed: markupFixed || undefined,
        priceMode: form.priceMode,
        taxRate: parseFloat(form.taxRate) || 20,
        categoryId: form.categoryId,
        stock: aggregates.stock,
        imageUrl: form.imageUrl || undefined,
        galleryImages: form.galleryImages.length ? form.galleryImages : undefined,
        hasVariants: form.hasVariants && variants.length > 0,
        variants: form.hasVariants && variants.length > 0 ? variants : undefined,
        active: form.active,
        featured: form.featured,
      };

      if (editingId) {
        await updateProduct(editingId, data);
      } else {
        await createProduct(data);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyProductForm);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingId(null);
    setForm(emptyProductForm);
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      costPrice: product.costPrice?.toString() || "",
      markupPercent: product.markupPercent?.toString() || "",
      markupFixed: product.markupFixed?.toString() || "",
      priceMode: product.priceMode || "manual",
      taxRate: (product.taxRate ?? 20).toString(),
      categoryId: product.categoryId,
      stock: product.stock.toString(),
      imageUrl: product.imageUrl || "",
      galleryImages: product.galleryImages || [],
      hasVariants: Boolean(product.hasVariants),
      variants: product.variants || [],
      active: product.active,
      featured: product.featured,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Produkt wirklich löschen?")) {
      await deleteProduct(id);
      await load();
    }
  };

  const handleStockAdjust = async (
    productId: string,
    productName: string,
    direction: "outbound"
  ) => {
    if (!user) return;
    const qty = parseInt(stockAdjust[productId] || "0", 10);
    if (!qty || qty <= 0) {
      alert("Bitte eine gültige Menge eingeben.");
      return;
    }
    await adjustProductStock(
      productId,
      -qty,
      direction,
      user.id,
      `Manuelle Ausbuchung: ${productName}`
    );
    setStockAdjust((prev) => ({ ...prev, [productId]: "" }));
    await load();
  };

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <AdminPageHeader
          title="Produkte"
          description="Artikel, Preise und Lagerbestände verwalten"
        />
        <Button
          className="w-full sm:w-auto shrink-0"
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyProductForm);
          }}
        >
          <Plus className="w-4 h-4" /> Neues Produkt
        </Button>
      </div>

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Produkt, Kategorie, Beschreibung…"
        resultCount={filteredProducts.length}
        totalCount={products.length}
      />

      <ProductFormPanel
        open={showForm}
        editingId={editingId}
        form={form}
        categories={categories}
        saving={saving}
        onChange={setForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <div className="lg:hidden space-y-3">
        {filteredProducts.map((p) => (
          <article
            key={p.id}
            className="bg-cream border border-wood/10 rounded-lg p-4 space-y-3 min-w-0"
          >
            <div className="flex gap-3 items-start">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-wood/5 border border-wood/10 shrink-0">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    className="object-cover"
                    unoptimized={p.imageUrl.includes("firebasestorage")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-stone">
                    –
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-wood-dark break-words">{p.name}</p>
                <p className="text-sm text-forest font-medium mt-0.5">{formatPrice(p.price)}</p>
                <p className="text-xs text-stone mt-1">
                  {categoryMap.get(p.categoryId) || "–"} · USt. {p.taxRate ?? 20} %
                </p>
              </div>
              <span
                className={`shrink-0 px-2 py-0.5 rounded-full text-xs ${
                  p.active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {p.active ? "Aktiv" : "Inaktiv"}
              </span>
            </div>

            <div className="text-sm">
              <p className={`font-medium ${p.stock <= 0 ? "text-red-600" : "text-wood-dark"}`}>
                Lager: {p.stock} Stück
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <StockInboundButton
                productId={p.id}
                productName={p.name}
                label="Nachbestellen"
                onSuccess={load}
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Menge"
                  value={stockAdjust[p.id] || ""}
                  onChange={(e) =>
                    setStockAdjust((prev) => ({ ...prev, [p.id]: e.target.value }))
                  }
                  className="flex-1 min-w-0 rounded border border-wood/20 bg-linen px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleStockAdjust(p.id, p.name, "outbound")}
                  className="text-sm text-red-600 hover:underline flex items-center gap-1 shrink-0 px-2"
                >
                  <PackageMinus className="w-4 h-4" />
                  Ausbuchen
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-wood/10">
              <button
                type="button"
                onClick={() => handleEdit(p)}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm border border-wood/20 rounded-lg hover:bg-wood/5"
              >
                <Pencil className="w-4 h-4" />
                Bearbeiten
              </button>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
        {filteredProducts.length === 0 && (
          <p className="text-center text-stone py-8">
            {search ? "Keine Produkte gefunden." : "Noch keine Produkte vorhanden."}
          </p>
        )}
      </div>

      <div className="hidden lg:block">
        <AdminDataTable minWidth="900px">
        <table className="w-full text-sm">
          <thead className="bg-wood/5">
            <tr>
              <th className="text-left p-4 font-medium text-wood-dark">Bild</th>
              <th className="text-left p-4 font-medium text-wood-dark">Name</th>
              <th className="text-left p-4 font-medium text-wood-dark">Preis</th>
              <th className="text-left p-4 font-medium text-wood-dark">Lager</th>
              <th className="text-left p-4 font-medium text-wood-dark">USt.</th>
              <th className="text-left p-4 font-medium text-wood-dark">Status</th>
              <th className="text-right p-4 font-medium text-wood-dark">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-t border-wood/10">
                <td className="p-4">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-wood/5 border border-wood/10">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        className="object-cover"
                        unoptimized={p.imageUrl.includes("firebasestorage")}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-stone">
                        –
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">{formatPrice(p.price)}</td>
                <td className="p-4">
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <span className={`font-medium ${p.stock <= 0 ? "text-red-600" : ""}`}>
                      {p.stock} Stück
                    </span>
                    <StockInboundButton
                      productId={p.id}
                      productName={p.name}
                      label="Nachbestellen"
                      onSuccess={load}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Menge"
                        value={stockAdjust[p.id] || ""}
                        onChange={(e) =>
                          setStockAdjust((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        className="w-16 rounded border border-wood/20 bg-linen px-2 py-1 text-xs"
                      />
                      <button
                        type="button"
                        title="Ausbuchen"
                        onClick={() => handleStockAdjust(p.id, p.name, "outbound")}
                        className="text-xs text-red-600 hover:underline flex items-center gap-1"
                      >
                        <PackageMinus className="w-3 h-3" />
                        Ausbuchen
                      </button>
                    </div>
                  </div>
                </td>
                <td className="p-4">{p.taxRate ?? 20} %</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      p.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.active ? "Aktiv" : "Inaktiv"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-1.5 hover:bg-wood/10 rounded"
                  >
                    <Pencil className="w-4 h-4 text-wood" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-wood/60">
                  {search ? "Keine Produkte gefunden." : "Noch keine Produkte vorhanden."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </AdminDataTable>
      </div>
    </div>
  );
}
