"use client";

import Image from "next/image";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { ProductVariant } from "@/lib/types";
import { newVariantId } from "@/lib/product-variants";
import Input from "@/components/ui/Input";
import ImageUpload from "@/components/ui/ImageUpload";

interface ProductVariantEditorProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

const emptyVariant = (): ProductVariant => ({
  id: newVariantId(),
  name: "",
  price: 0,
  stock: 0,
  imageUrl: "",
  active: true,
  sortOrder: 0,
});

export default function ProductVariantEditor({
  variants,
  onChange,
}: ProductVariantEditorProps) {
  const updateVariant = (id: string, patch: Partial<ProductVariant>) => {
    onChange(
      variants.map((variant) =>
        variant.id === id ? { ...variant, ...patch } : variant
      )
    );
  };

  const removeVariant = (id: string) => {
    onChange(variants.filter((variant) => variant.id !== id));
  };

  const addVariant = () => {
    onChange([
      ...variants,
      { ...emptyVariant(), sortOrder: variants.length },
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-wood-dark">Varianten</p>
          <p className="text-xs text-stone mt-1">
            Jede Variante mit eigenem Preis, Bild und Lagerbestand.
          </p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-2 rounded-lg border border-wood/20 px-3 py-2 text-sm hover:bg-wood/5"
        >
          <Plus className="h-4 w-4" />
          Variante
        </button>
      </div>

      {variants.length === 0 ? (
        <p className="text-sm text-stone rounded-xl border border-dashed border-wood/20 p-4">
          Noch keine Varianten. Ohne Varianten gelten der Produktpreis und Lagerbestand oben.
        </p>
      ) : (
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div
              key={variant.id}
              className="rounded-2xl border border-wood/10 bg-linen/50 p-4 space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-wood-dark">
                  <GripVertical className="h-4 w-4 text-stone" />
                  Variante {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(variant.id)}
                  className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline"
                >
                  <Trash2 className="h-4 w-4" />
                  Entfernen
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Bezeichnung"
                  value={variant.name}
                  onChange={(e) => updateVariant(variant.id, { name: e.target.value })}
                  placeholder="z. B. Groß / Natur"
                  required
                />
                <Input
                  label="Preis (€, brutto)"
                  type="number"
                  step="0.01"
                  value={variant.price ? String(variant.price) : ""}
                  onChange={(e) =>
                    updateVariant(variant.id, {
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
                <Input
                  label="Lagerbestand"
                  type="number"
                  value={variant.stock ? String(variant.stock) : ""}
                  onChange={(e) =>
                    updateVariant(variant.id, {
                      stock: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
                <label className="flex items-center gap-2 text-sm mt-7">
                  <input
                    type="checkbox"
                    checked={variant.active}
                    onChange={(e) =>
                      updateVariant(variant.id, { active: e.target.checked })
                    }
                  />
                  Aktiv
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-start">
                {variant.imageUrl ? (
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-wood/15">
                    <Image
                      src={variant.imageUrl}
                      alt={variant.name || "Variante"}
                      fill
                      className="object-cover"
                      unoptimized={variant.imageUrl.includes("firebasestorage")}
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-xl border border-dashed border-wood/20 bg-cream" />
                )}
                <ImageUpload
                  value={variant.imageUrl || ""}
                  onChange={(url) => updateVariant(variant.id, { imageUrl: url })}
                  folder="products"
                  label="Variantenbild"
                  hint="Wird in Shop und Galerie verwendet"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
