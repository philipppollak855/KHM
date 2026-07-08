"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  slugify,
  formatPrice,
} from "@/lib/firestore";
import type { Product, Category } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ImageUpload from "@/components/ui/ImageUpload";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  stock: "",
  imageUrl: "",
  active: true,
  featured: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);

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
    const data = {
      name: form.name,
      slug: slugify(form.name),
      description: form.description,
      price: parseFloat(form.price),
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
              label="Preis (€)"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
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
              <th className="text-left p-4 font-medium text-wood-dark">Name</th>
              <th className="text-left p-4 font-medium text-wood-dark">Preis</th>
              <th className="text-left p-4 font-medium text-wood-dark">Lager</th>
              <th className="text-left p-4 font-medium text-wood-dark">Status</th>
              <th className="text-right p-4 font-medium text-wood-dark">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-wood/10">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">{formatPrice(p.price)}</td>
                <td className="p-4">{p.stock}</td>
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
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-wood/60">
                  Noch keine Produkte vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
