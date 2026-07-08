"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  slugify,
} from "@/lib/firestore";
import type { Category } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

const emptyCategory = {
  name: "",
  description: "",
  sortOrder: "0",
  active: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCategory);

  const load = async () => {
    setCategories(await getCategories());
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
      sortOrder: parseInt(form.sortOrder) || 0,
      active: form.active,
    };

    if (editingId) {
      await updateCategory(editingId, data);
    } else {
      await createCategory(data);
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyCategory);
    await load();
  };

  const handleEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      description: cat.description,
      sortOrder: cat.sortOrder.toString(),
      active: cat.active,
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Kategorie wirklich löschen?")) {
      await deleteCategory(id);
      await load();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-wood-dark">
          Kategorien
        </h1>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyCategory);
          }}
        >
          <Plus className="w-4 h-4" /> Neue Kategorie
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-cream rounded-2xl p-6 border border-wood/10 shadow-sm mb-8 space-y-4"
        >
          <h2 className="font-display text-xl font-semibold">
            {editingId ? "Kategorie bearbeiten" : "Neue Kategorie"}
          </h2>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Textarea
            label="Beschreibung"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Sortierung"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Aktiv
          </label>
          <div className="flex gap-3">
            <Button type="submit">
              {editingId ? "Speichern" : "Erstellen"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
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
              <th className="text-left p-4 font-medium text-wood-dark">Beschreibung</th>
              <th className="text-left p-4 font-medium text-wood-dark">Sortierung</th>
              <th className="text-left p-4 font-medium text-wood-dark">Status</th>
              <th className="text-right p-4 font-medium text-wood-dark">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-wood/10">
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4 text-wood/60 max-w-xs truncate">
                  {c.description}
                </td>
                <td className="p-4">{c.sortOrder}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      c.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.active ? "Aktiv" : "Inaktiv"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-1.5 hover:bg-wood/10 rounded"
                  >
                    <Pencil className="w-4 h-4 text-wood" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-wood/60">
                  Noch keine Kategorien vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
