"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  getShippingZones,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone,
  seedShippingZones,
} from "@/lib/firestore";
import type { ShippingZone } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import { matchesSearch } from "@/lib/search";

const emptyZone = {
  name: "",
  countries: "Österreich",
  zipPrefixes: "",
  zipFrom: "",
  zipTo: "",
  baseCost: "",
  freeFrom: "",
  costPerKm: "",
  sortOrder: "0",
  active: true,
};

export default function AdminShippingPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyZone);
  const [search, setSearch] = useState("");

  const load = async () => {
    await seedShippingZones();
    setZones(await getShippingZones());
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const parseForm = () => ({
    name: form.name,
    countries: form.countries.split(",").map((c) => c.trim()).filter(Boolean),
    zipPrefixes: form.zipPrefixes
      ? form.zipPrefixes.split(",").map((z) => z.trim()).filter(Boolean)
      : undefined,
    zipFrom: form.zipFrom || undefined,
    zipTo: form.zipTo || undefined,
    baseCost: parseFloat(form.baseCost) || 0,
    freeFrom: form.freeFrom ? parseFloat(form.freeFrom) : undefined,
    costPerKm: form.costPerKm ? parseFloat(form.costPerKm) : undefined,
    sortOrder: parseInt(form.sortOrder) || 0,
    active: form.active,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = parseForm();
    if (editingId) {
      await updateShippingZone(editingId, data);
    } else {
      await createShippingZone(data);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyZone);
    await load();
  };

  const handleEdit = (z: ShippingZone) => {
    setForm({
      name: z.name,
      countries: z.countries.join(", "),
      zipPrefixes: z.zipPrefixes?.join(", ") || "",
      zipFrom: z.zipFrom || "",
      zipTo: z.zipTo || "",
      baseCost: z.baseCost.toString(),
      freeFrom: z.freeFrom?.toString() || "",
      costPerKm: z.costPerKm?.toString() || "",
      sortOrder: z.sortOrder.toString(),
      active: z.active,
    });
    setEditingId(z.id);
    setShowForm(true);
  };

  const filteredZones = useMemo(
    () =>
      zones.filter((z) =>
        matchesSearch(search, [
          z.name,
          z.countries.join(" "),
          z.zipPrefixes?.join(" "),
          z.zipFrom,
          z.zipTo,
          z.baseCost,
        ])
      ),
    [zones, search]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light text-wood-dark">Versandzonen</h1>
          <p className="text-stone text-sm mt-1">Kosten nach Region, PLZ und Entfernung</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyZone); }}>
          <Plus className="w-4 h-4" /> Neue Zone
        </Button>
      </div>

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Zone, Land, PLZ…"
        resultCount={filteredZones.length}
        totalCount={zones.length}
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-cream p-6 border border-wood/10 mb-8 space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Länder (kommagetrennt)" value={form.countries} onChange={(e) => setForm({ ...form, countries: e.target.value })} />
          <Input label="PLZ-Präfixe (z. B. 26, 27)" value={form.zipPrefixes} onChange={(e) => setForm({ ...form, zipPrefixes: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="PLZ von" value={form.zipFrom} onChange={(e) => setForm({ ...form, zipFrom: e.target.value })} />
            <Input label="PLZ bis" value={form.zipTo} onChange={(e) => setForm({ ...form, zipTo: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="Grundpreis (€)" type="number" step="0.01" value={form.baseCost} onChange={(e) => setForm({ ...form, baseCost: e.target.value })} required />
            <Input label="Gratis ab (€)" type="number" step="0.01" value={form.freeFrom} onChange={(e) => setForm({ ...form, freeFrom: e.target.value })} />
            <Input label="€ pro km" type="number" step="0.01" value={form.costPerKm} onChange={(e) => setForm({ ...form, costPerKm: e.target.value })} />
            <Input label="Sortierung" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Aktiv
          </label>
          <div className="flex gap-3">
            <Button type="submit">Speichern</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Abbrechen</Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {filteredZones.map((z) => (
          <div key={z.id} className="bg-cream border border-wood/10 p-5 flex flex-wrap justify-between gap-4">
            <div>
              <p className="font-medium text-wood-dark">{z.name}</p>
              <p className="text-sm text-stone mt-1">
                {z.countries.join(", ")} · {z.baseCost.toFixed(2)} €
                {z.freeFrom ? ` · gratis ab ${z.freeFrom} €` : ""}
                {z.costPerKm ? ` · ${z.costPerKm} €/km` : ""}
              </p>
              {z.zipPrefixes && <p className="text-xs text-stone">PLZ: {z.zipPrefixes.join(", ")}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(z)} className="p-2 hover:bg-wood/10"><Pencil className="w-4 h-4" /></button>
              {!z.id.startsWith("default-") && (
                <button onClick={() => deleteShippingZone(z.id).then(load)} className="p-2 hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-600" /></button>
              )}
            </div>
          </div>
        ))}
        {filteredZones.length === 0 && (
          <p className="text-center text-stone py-8">
            {search ? "Keine Versandzonen gefunden." : "Noch keine Versandzonen."}
          </p>
        )}
      </div>
    </div>
  );
}
