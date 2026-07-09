import { calculateSellingPrice, roundCurrency } from "@/lib/pricing";
import type { CartItem } from "@/lib/types";

type ProductData = {
  name?: string;
  price?: number;
  costPrice?: number;
  markupPercent?: number;
  markupFixed?: number;
  priceMode?: string;
  taxRate?: number;
  active?: boolean;
  stock?: number;
};

export function resolveProductUnitPrice(data: ProductData): number {
  const cost = data.costPrice ?? 0;
  if (data.priceMode === "calculated" && cost > 0) {
    return calculateSellingPrice(
      cost,
      data.markupPercent ?? 0,
      data.markupFixed ?? 0
    );
  }
  return roundCurrency((data.price as number) ?? 0);
}

export async function resolveCartItemsServer(
  tx: FirebaseFirestore.Transaction,
  db: FirebaseFirestore.Firestore,
  cartItems: CartItem[]
): Promise<CartItem[]> {
  if (!cartItems.length) {
    throw new Error("Warenkorb ist leer.");
  }

  const resolved: CartItem[] = [];

  for (const item of cartItems) {
    if (!item.productId || item.quantity < 1) {
      throw new Error("Ungültiger Warenkorbeintrag.");
    }

    const ref = db.collection("products").doc(item.productId);
    const snap = await tx.get(ref);
    if (!snap.exists) {
      throw new Error(`Produkt „${item.name || item.productId}“ nicht gefunden.`);
    }

    const data = snap.data() as ProductData;
    if (!data.active) {
      throw new Error(`Produkt „${data.name || item.name}“ ist nicht aktiv.`);
    }

    const price = resolveProductUnitPrice(data);
    if (price <= 0) {
      throw new Error(`Produkt „${data.name || item.name}“ hat keinen gültigen Preis.`);
    }

    resolved.push({
      productId: item.productId,
      name: (data.name as string) || item.name,
      price,
      quantity: item.quantity,
      taxRate: (data.taxRate as number) ?? 20,
      imageUrl: item.imageUrl,
      maxStock: (data.stock as number) ?? 0,
    });
  }

  return resolved;
}
