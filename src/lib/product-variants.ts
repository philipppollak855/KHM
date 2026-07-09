import type { CartItem, Product, ProductVariant } from "./types";

export function newVariantId(): string {
  return `var-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function productHasVariants(product: Product): boolean {
  return Boolean(product.hasVariants && product.variants && product.variants.length > 0);
}

export function getActiveVariants(product: Product): ProductVariant[] {
  if (!productHasVariants(product)) return [];
  return [...(product.variants || [])]
    .filter((v) => v.active !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function getVariant(
  product: Product,
  variantId?: string
): ProductVariant | null {
  if (!variantId || !productHasVariants(product)) return null;
  return product.variants?.find((v) => v.id === variantId) ?? null;
}

export function getProductListPrice(product: Product): number {
  const variants = getActiveVariants(product);
  if (variants.length === 0) return product.price;
  return Math.min(...variants.map((v) => v.price));
}

export function getProductListStock(product: Product): number {
  const variants = getActiveVariants(product);
  if (variants.length === 0) return product.stock;
  return variants.reduce((s, v) => s + (v.stock ?? 0), 0);
}

export function getProductPrimaryImage(
  product: Product,
  variantId?: string
): string | undefined {
  const variant = getVariant(product, variantId);
  if (variant?.imageUrl) return variant.imageUrl;
  if (product.imageUrl) return product.imageUrl;
  return getActiveVariants(product).find((v) => v.imageUrl)?.imageUrl;
}

export function getProductGalleryImages(
  product: Product,
  selectedVariantId?: string
): string[] {
  const images: string[] = [];
  const add = (url?: string) => {
    if (url && !images.includes(url)) images.push(url);
  };

  const variant = getVariant(product, selectedVariantId);
  if (variant?.imageUrl) add(variant.imageUrl);

  add(product.imageUrl);
  product.galleryImages?.forEach(add);

  if (productHasVariants(product)) {
    getActiveVariants(product).forEach((v) => add(v.imageUrl));
  }

  return images;
}

export function getCartLineKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

export function getCartItemLineKey(item: Pick<CartItem, "productId" | "variantId">): string {
  return getCartLineKey(item.productId, item.variantId);
}

export function syncProductAggregates(variants: ProductVariant[]): {
  price: number;
  stock: number;
} {
  const active = variants.filter((v) => v.active !== false);
  if (active.length === 0) return { price: 0, stock: 0 };
  return {
    price: Math.min(...active.map((v) => v.price)),
    stock: active.reduce((s, v) => s + (v.stock ?? 0), 0),
  };
}

export function formatProductPriceRange(product: Product): {
  min: number;
  max: number;
  hasRange: boolean;
} {
  const variants = getActiveVariants(product);
  if (variants.length === 0) {
    return { min: product.price, max: product.price, hasRange: false };
  }
  const prices = variants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max, hasRange: min !== max };
}

export function getCartDisplayName(item: CartItem): string {
  return item.variantName ? `${item.name} – ${item.variantName}` : item.name;
}

export function parseVariantsFromFirestore(raw: unknown): ProductVariant[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw.map((v, index) => {
    const row = v as Record<string, unknown>;
    return {
      id: String(row.id || newVariantId()),
      name: String(row.name || `Variante ${index + 1}`),
      price: Number(row.price) || 0,
      stock: Number(row.stock) || 0,
      imageUrl: row.imageUrl ? String(row.imageUrl) : undefined,
      active: row.active !== false,
      sortOrder: typeof row.sortOrder === "number" ? row.sortOrder : index,
    };
  });
}
