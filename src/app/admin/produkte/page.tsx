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
import { matchesSearch } from "@/lib/search";
import type { Product, Category } from "@/lib/types";
import { calculateSellingPrice, TAX_RATES_AT } from "@/lib/pricing";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ImageUpload from "@/components/ui/ImageUpload";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  costPrice: "",
  markupPercent: "",
  markupFixed: "",
  priceMode: "manual" as "manual" | "calculated",
  taxRate: "20",
  categoryId: "",
  stock: "",
  imageUrl: "",
  active: true,
  featured: false,
};

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(form.costPrice) || 0;
    const markupPercent = parseFloat(form.markupPercent) || 0;
    const markupFixed = parseFloat(form.markupFixed) || 0;
    const price =
      form.priceMode === "calculated" && cost > 0
        ? calculateSellingPrice(cost, markupPercent, markupFixed)
        : parseFloat(form.price);

    const data = {
      name: form.name,
      slug: slugify(form.name),
      description: form.description,
      price,
      costPrice: cost || undefined,
      markupPercent: markupPercent || undefined,
      markupFixed: markupFixed || undefined,
      priceMode: form.priceMode,
      taxRate: parseFloat(form.taxRate) || 20,
      categoryId: form.categoryId,
      stock: parseInt(form.stock) || 0,
      imageUrl: form.imageUrl || undefined,
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
    setForm(emptyProduct);
    await load();
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-wood-dark">
          Produkte
        </h1>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyProduct);
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

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-cream rounded-2xl p-6 border border-wood/10 shadow-sm mb-8 space-y-4"
        >
          <h2 className="font-display text-xl font-semibold">
            {editingId ? "Produkt bearbeiten" : "Neues Produkt"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Verkaufspreis (€, brutto)"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value, priceMode: "manual" })}
              required={form.priceMode === "manual"}
              disabled={form.priceMode === "calculated"}
            />
            <Input
              label="Einkaufspreis (€)"
              type="number"
              step="0.01"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
            />
            <Input
              label="Aufschlag (%)"
              type="number"
              step="0.1"
              value={form.markupPercent}
              onChange={(e) => setForm({ ...form, markupPercent: e.target.value })}
            />
            <Input
              label="Aufschlag (€ fest)"
              type="number"
              step="0.01"
              value={form.markupFixed}
              onChange={(e) => setForm({ ...form, markupFixed: e.target.value })}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-wood-dark">Preisberechnung</label>
              <select
                value={form.priceMode}
                onChange={(e) => setForm({ ...form, priceMode: e.target.value as "manual" | "calculated" })}
                className="w-full rounded-lg border-2 border-wood/20 bg-cream px-4 py-2.5"
              >
                <option value="manual">Manueller Verkaufspreis</option>
                <option value="calculated">Aus EK + Aufschlag berechnen</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-wood-dark">USt.-Satz</label>
              <select
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                className="w-full rounded-lg border-2 border-wood/20 bg-cream px-4 py-2.5"
              >
                {TAX_RATES_AT.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-wood-dark">Kategorie</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full rounded-lg border-2 border-wood/20 bg-cream px-4 py-2.5"
                required
              >
                <option value="">Kategorie wählen</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Lagerbestand"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <ImageUpload
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            folder="products"
          />
          <Textarea
            label="Beschreibung"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Aktiv
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Empfehlung
            </label>
          </div>
          <div className="flex gap-3">
            <Button type="submit">
              {editingId ? "Speichern" : "Erstellen"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Abbrechen
            </Button>
          </div>
        </form>
      )}

      <div className="bg-cream rounded-2xl border border-wood/10 overflow-hidden">
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
      </div>
    </div>
  );
}
