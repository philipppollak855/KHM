"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  FileText,
  CircleDollarSign,
  Images,
  Layers,
  Loader2,
} from "lucide-react";
import type { Category, ProductVariant } from "@/lib/types";
import { calculateSellingPrice, TAX_RATES_AT } from "@/lib/pricing";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ImageUpload from "@/components/ui/ImageUpload";
import ImageListUpload from "@/components/admin/ImageListUpload";
import ProductVariantEditor from "@/components/admin/ProductVariantEditor";

export type ProductFormState = {
  name: string;
  description: string;
  price: string;
  costPrice: string;
  markupPercent: string;
  markupFixed: string;
  priceMode: "manual" | "calculated";
  taxRate: string;
  categoryId: string;
  stock: string;
  imageUrl: string;
  galleryImages: string[];
  hasVariants: boolean;
  variants: ProductVariant[];
  active: boolean;
  featured: boolean;
};

export const emptyProductForm: ProductFormState = {
  name: "",
  description: "",
  price: "",
  costPrice: "",
  markupPercent: "",
  markupFixed: "",
  priceMode: "manual",
  taxRate: "20",
  categoryId: "",
  stock: "",
  imageUrl: "",
  galleryImages: [],
  hasVariants: false,
  variants: [],
  active: true,
  featured: false,
};

type TabId = "basics" | "pricing" | "media" | "variants";

const tabs: { id: TabId; label: string; icon: typeof FileText }[] = [
  { id: "basics", label: "Grundlagen", icon: FileText },
  { id: "pricing", label: "Preis & Lager", icon: CircleDollarSign },
  { id: "media", label: "Bilder", icon: Images },
  { id: "variants", label: "Varianten", icon: Layers },
];

interface ProductFormPanelProps {
  open: boolean;
  editingId: string | null;
  form: ProductFormState;
  categories: Category[];
  saving?: boolean;
  onChange: (form: ProductFormState) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}

export default function ProductFormPanel({
  open,
  editingId,
  form,
  categories,
  saving = false,
  onChange,
  onClose,
  onSubmit,
}: ProductFormPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("basics");

  useEffect(() => {
    if (!open) return;

    setActiveTab("basics");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, saving]);

  const calculatedPrice = useMemo(() => {
    const cost = parseFloat(form.costPrice) || 0;
    const markupPercent = parseFloat(form.markupPercent) || 0;
    const markupFixed = parseFloat(form.markupFixed) || 0;
    if (form.priceMode !== "calculated" || cost <= 0) return null;
    return calculateSellingPrice(cost, markupPercent, markupFixed);
  }, [form.costPrice, form.markupPercent, form.markupFixed, form.priceMode]);

  if (!open) return null;

  const set = (patch: Partial<ProductFormState>) => onChange({ ...form, ...patch });
  const variantsLocked = form.hasVariants && form.variants.length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-wood-dark/50 backdrop-blur-sm"
        aria-label="Produktformular schließen"
        onClick={() => !saving && onClose()}
      />

      <aside
        className="relative flex h-full max-h-dvh w-full max-w-2xl flex-col bg-cream shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
      >
        <header className="shrink-0 border-b border-wood/10 bg-linen px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-stone">
                {editingId ? "Produkt bearbeiten" : "Neues Produkt"}
              </p>
              <h2
                id="product-form-title"
                className="truncate font-display text-xl font-light text-wood-dark"
              >
                {form.name.trim() || "Ohne Titel"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="shrink-0 rounded-lg p-2 text-stone hover:bg-wood/10 disabled:opacity-50"
              aria-label="Schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav
            className="mt-4 flex gap-1 overflow-x-auto scrollbar-none -mx-1 px-1"
            aria-label="Produktbereiche"
          >
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeTab === id
                    ? "bg-forest text-cream"
                    : "text-wood-dark hover:bg-wood/8"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </nav>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeTab === "basics" && (
              <div className="space-y-4 max-w-xl">
                <Input
                  label="Name"
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  required
                  autoFocus
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-wood-dark">Kategorie</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => set({ categoryId: e.target.value })}
                    className="w-full rounded-lg border-2 border-wood/20 bg-linen px-4 py-2.5"
                    required
                  >
                    <option value="">Kategorie wählen</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Textarea
                  label="Beschreibung"
                  value={form.description}
                  onChange={(e) => set({ description: e.target.value })}
                  required
                />
                <div className="flex flex-wrap gap-4 rounded-xl border border-wood/10 bg-linen/50 p-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => set({ active: e.target.checked })}
                    />
                    Im Shop aktiv
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => set({ featured: e.target.checked })}
                    />
                    Als Empfehlung
                  </label>
                </div>
              </div>
            )}

            {activeTab === "pricing" && (
              <div className="space-y-4 max-w-xl">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-wood-dark">Preisberechnung</label>
                  <select
                    value={form.priceMode}
                    onChange={(e) =>
                      set({ priceMode: e.target.value as "manual" | "calculated" })
                    }
                    className="w-full rounded-lg border-2 border-wood/20 bg-linen px-4 py-2.5"
                    disabled={variantsLocked}
                  >
                    <option value="manual">Manueller Verkaufspreis</option>
                    <option value="calculated">Aus EK + Aufschlag berechnen</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Verkaufspreis (€, brutto)"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      set({ price: e.target.value, priceMode: "manual" })
                    }
                    required={form.priceMode === "manual" && !variantsLocked}
                    disabled={variantsLocked || form.priceMode === "calculated"}
                  />
                  <Input
                    label="Lagerbestand"
                    type="number"
                    value={form.stock}
                    onChange={(e) => set({ stock: e.target.value })}
                    disabled={form.hasVariants}
                  />
                  <Input
                    label="Einkaufspreis (€)"
                    type="number"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(e) => set({ costPrice: e.target.value })}
                    disabled={variantsLocked}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-wood-dark">USt.-Satz</label>
                    <select
                      value={form.taxRate}
                      onChange={(e) => set({ taxRate: e.target.value })}
                      className="w-full rounded-lg border-2 border-wood/20 bg-linen px-4 py-2.5"
                    >
                      {TAX_RATES_AT.map((rate) => (
                        <option key={rate.value} value={rate.value}>
                          {rate.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Aufschlag (%)"
                    type="number"
                    step="0.1"
                    value={form.markupPercent}
                    onChange={(e) => set({ markupPercent: e.target.value })}
                    disabled={variantsLocked}
                  />
                  <Input
                    label="Aufschlag (€ fest)"
                    type="number"
                    step="0.01"
                    value={form.markupFixed}
                    onChange={(e) => set({ markupFixed: e.target.value })}
                    disabled={variantsLocked}
                  />
                </div>

                {variantsLocked && (
                  <p className="text-sm text-stone rounded-lg border border-wood/10 bg-linen/60 px-3 py-2">
                    Preis und Lager werden über die Varianten verwaltet.
                  </p>
                )}

                {calculatedPrice !== null && !variantsLocked && (
                  <p className="text-sm text-forest font-medium">
                    Berechneter Verkaufspreis: {calculatedPrice.toFixed(2)} €
                  </p>
                )}
              </div>
            )}

            {activeTab === "media" && (
              <div className="space-y-6 max-w-xl">
                <ImageUpload
                  value={form.imageUrl}
                  onChange={(url) => set({ imageUrl: url })}
                  folder="products"
                  label="Hauptbild"
                />
                <ImageListUpload
                  label="Zusätzliche Galeriebilder"
                  hint="Für Landingpage und Produktdetail – per Wischen durchblättern."
                  images={form.galleryImages}
                  onChange={(galleryImages) => set({ galleryImages })}
                />
              </div>
            )}

            {activeTab === "variants" && (
              <div className="space-y-4 max-w-xl">
                <label className="flex items-center gap-2 text-sm font-medium text-wood-dark rounded-xl border border-wood/10 bg-linen/50 p-4">
                  <input
                    type="checkbox"
                    checked={form.hasVariants}
                    onChange={(e) => set({ hasVariants: e.target.checked })}
                  />
                  Produkt mit Varianten (eigene Preise, Bilder & Lager)
                </label>
                {form.hasVariants ? (
                  <ProductVariantEditor
                    variants={form.variants}
                    onChange={(variants) => set({ variants })}
                  />
                ) : (
                  <p className="text-sm text-stone">
                    Ohne Varianten gelten der Preis und Lagerbestand aus dem Tab
                    „Preis & Lager“.
                  </p>
                )}
              </div>
            )}
          </div>

          <footer className="shrink-0 border-t border-wood/10 bg-linen px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={onClose}
                disabled={saving}
              >
                Abbrechen
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Speichern…
                  </>
                ) : editingId ? (
                  "Speichern"
                ) : (
                  "Produkt erstellen"
                )}
              </Button>
            </div>
          </footer>
        </form>
      </aside>
    </div>
  );
}
