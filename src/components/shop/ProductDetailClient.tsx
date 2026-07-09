"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/firestore";
import { useCart } from "@/context/CartContext";
import {
  getActiveVariants,
  getProductGalleryImages,
  productHasVariants,
} from "@/lib/product-variants";
import ProductImageGallery from "@/components/shop/ProductImageGallery";
import Button from "@/components/ui/Button";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const variants = useMemo(() => getActiveVariants(product), [product]);
  const hasVariants = productHasVariants(product);
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants[0]?.id || ""
  );

  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId);
  const displayPrice = hasVariants ? selectedVariant?.price ?? product.price : product.price;
  const displayStock = hasVariants ? selectedVariant?.stock ?? 0 : product.stock;
  const galleryImages = getProductGalleryImages(product, selectedVariantId);

  const handleAdd = () => {
    if (hasVariants && !selectedVariant) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantName: selectedVariant?.name,
      price: displayPrice,
      taxRate: product.taxRate ?? 20,
      imageUrl: selectedVariant?.imageUrl || product.imageUrl,
      maxStock: displayStock,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm text-forest hover:underline mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Kollektion
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        <ProductImageGallery
          images={galleryImages}
          alt={product.name}
          aspectClassName="aspect-[4/5] lg:aspect-square"
          priority
        />

        <div className="flex flex-col">
          <p className="text-xs tracking-[0.2em] uppercase text-stone mb-3">Handgemacht</p>
          <h1 className="font-display text-4xl font-light text-wood-dark mb-4">
            {product.name}
          </h1>
          <p className="text-stone leading-relaxed mb-6">{product.description}</p>

          {hasVariants && (
            <div className="mb-6">
              <p className="text-sm font-medium text-wood-dark mb-3">Variante wählen</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      selectedVariantId === variant.id
                        ? "border-forest bg-forest text-linen"
                        : "border-wood/20 text-wood-dark hover:border-forest/40"
                    }`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto space-y-4">
            <div>
              <p className="font-display text-3xl text-forest">
                {formatPrice(displayPrice)}
              </p>
              <p className="text-sm text-stone mt-1">
                inkl. {product.taxRate ?? 20} % USt.
                {displayStock > 0
                  ? ` · ${displayStock} auf Lager`
                  : " · Derzeit ausverkauft"}
              </p>
            </div>

            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleAdd}
              disabled={displayStock <= 0 || (hasVariants && !selectedVariant)}
            >
              <ShoppingBag className="h-5 w-5" />
              {displayStock > 0 ? "In den Warenkorb" : "Ausverkauft"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
