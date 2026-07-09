"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/firestore";
import { useCart } from "@/context/CartContext";
import {
  formatProductPriceRange,
  getActiveVariants,
  getProductGalleryImages,
  getProductListStock,
  productHasVariants,
} from "@/lib/product-variants";
import ProductImageGallery from "@/components/shop/ProductImageGallery";

interface ProductCardPremiumProps {
  product: Product;
}

export default function ProductCardPremium({ product }: ProductCardPremiumProps) {
  const { addItem } = useCart();
  const hasVariants = productHasVariants(product);
  const variants = useMemo(() => getActiveVariants(product), [product]);
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || "");
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId);
  const stock = hasVariants ? selectedVariant?.stock ?? 0 : getProductListStock(product);
  const priceRange = formatProductPriceRange(product);
  const displayPrice = hasVariants
    ? selectedVariant?.price ?? priceRange.min
    : priceRange.min;
  const galleryImages = getProductGalleryImages(product, selectedVariantId);

  const handleAdd = () => {
    if (hasVariants) {
      if (!selectedVariant || selectedVariant.stock <= 0) return;
      addItem({
        productId: product.id,
        variantId: selectedVariant.id,
        name: product.name,
        variantName: selectedVariant.name,
        price: selectedVariant.price,
        taxRate: product.taxRate ?? 20,
        imageUrl: selectedVariant.imageUrl || product.imageUrl,
        maxStock: selectedVariant.stock,
      });
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      taxRate: product.taxRate ?? 20,
      imageUrl: product.imageUrl,
      maxStock: product.stock,
    });
  };

  return (
    <article className="group">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-linen-dark mb-5">
          <ProductImageGallery
            images={galleryImages}
            alt={product.name}
            aspectClassName="h-full w-full"
            showDots={galleryImages.length > 1}
          />
          <div className="pointer-events-none absolute inset-0 bg-wood-dark/0 group-hover:bg-wood-dark/10 transition-colors duration-500" />
          {product.featured && (
            <span className="absolute top-4 left-4 z-10 text-[10px] tracking-[0.25em] uppercase text-linen bg-wood-dark/70 backdrop-blur-sm px-3 py-1.5">
              Empfehlung
            </span>
          )}
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              handleAdd();
            }}
            disabled={stock <= 0}
            className="absolute bottom-4 right-4 z-10 w-11 h-11 bg-linen text-wood-dark flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-wheat hover:text-linen disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="In den Warenkorb"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </Link>

      <div className="space-y-2">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-display text-xl font-light text-wood-dark group-hover:text-forest transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-stone text-sm leading-relaxed line-clamp-2">
          {product.description}
        </p>

        {hasVariants && variants.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  selectedVariantId === variant.id
                    ? "border-forest bg-forest text-linen"
                    : "border-wood/15 text-wood-dark hover:border-forest/30"
                }`}
              >
                {variant.name}
              </button>
            ))}
          </div>
        )}

        <p className="font-display text-lg text-bark pt-1">
          {hasVariants && priceRange.hasRange && !selectedVariant
            ? `ab ${formatPrice(priceRange.min)}`
            : formatPrice(displayPrice)}
        </p>
      </div>
    </article>
  );
}
