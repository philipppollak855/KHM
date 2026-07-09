import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
import { getCartLineKey } from "@/lib/product-variants";

export class InsufficientStockError extends Error {
  constructor(
    public productName: string,
    public available: number,
    public requested: number
  ) {
    super(
      `Nicht genug Lagerbestand für „${productName}“ (verfügbar: ${available}, bestellt: ${requested}).`
    );
    this.name = "InsufficientStockError";
  }
}

type VariantRow = {
  id: string;
  name?: string;
  stock?: number;
  active?: boolean;
};

type ProductStockData = {
  name?: string;
  stock?: number;
  hasVariants?: boolean;
  variants?: VariantRow[];
};

export type StockDeductionLine = {
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
};

function aggregateStockLines(lines: StockDeductionLine[]): StockDeductionLine[] {
  const totals = new Map<string, StockDeductionLine>();
  for (const line of lines) {
    const key = getCartLineKey(line.productId, line.variantId);
    const existing = totals.get(key);
    if (existing) {
      existing.quantity += line.quantity;
    } else {
      totals.set(key, { ...line });
    }
  }
  return Array.from(totals.values());
}

function sumVariantStock(variants: VariantRow[]): number {
  return variants.reduce(
    (sum, variant) =>
      variant.active === false ? sum : sum + ((variant.stock as number) ?? 0),
    0
  );
}

export async function deductStockInTransaction(
  tx: FirebaseFirestore.Transaction,
  db: FirebaseFirestore.Firestore,
  lines: StockDeductionLine[],
  meta: {
    orderId: string;
    orderNumber: string;
    userId: string;
    reason?: string;
  }
) {
  const aggregated = aggregateStockLines(lines);

  for (const line of aggregated) {
    const productRef = db.collection("products").doc(line.productId);
    const snap = await tx.get(productRef);
    if (!snap.exists) {
      throw new Error(`Produkt „${line.name}“ nicht gefunden.`);
    }

    const data = snap.data() as ProductStockData;
    const productName = (data.name as string) || line.name;

    if (line.variantId && data.hasVariants) {
      const variants = [...(data.variants || [])];
      const index = variants.findIndex((variant) => variant.id === line.variantId);
      if (index < 0) {
        throw new Error(`Variante für „${productName}“ nicht gefunden.`);
      }

      const variant = variants[index];
      const currentStock = (variant.stock as number) ?? 0;
      if (currentStock < line.quantity) {
        throw new InsufficientStockError(
          `${productName} – ${variant.name || "Variante"}`,
          currentStock,
          line.quantity
        );
      }

      const stockAfter = currentStock - line.quantity;
      variants[index] = { ...variant, stock: stockAfter };

      tx.update(productRef, {
        variants,
        stock: sumVariantStock(variants),
      });

      tx.set(db.collection("stockMovements").doc(), {
        productId: line.productId,
        variantId: line.variantId,
        productName: `${productName} – ${variant.name || "Variante"}`,
        delta: -line.quantity,
        stockAfter,
        reason: meta.reason || "order",
        orderId: meta.orderId,
        orderNumber: meta.orderNumber,
        note: null,
        createdBy: meta.userId,
        createdAt: FieldValue.serverTimestamp(),
      });
      continue;
    }

    const currentStock = (data.stock as number) ?? 0;
    if (currentStock < line.quantity) {
      throw new InsufficientStockError(productName, currentStock, line.quantity);
    }

    const stockAfter = currentStock - line.quantity;
    tx.update(productRef, { stock: stockAfter });
    tx.set(db.collection("stockMovements").doc(), {
      productId: line.productId,
      variantId: null,
      productName,
      delta: -line.quantity,
      stockAfter,
      reason: meta.reason || "order",
      orderId: meta.orderId,
      orderNumber: meta.orderNumber,
      note: null,
      createdBy: meta.userId,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
}

export async function restockInTransaction(
  tx: FirebaseFirestore.Transaction,
  db: FirebaseFirestore.Firestore,
  lines: StockDeductionLine[],
  meta: {
    orderId: string;
    orderNumber: string;
    userId: string;
    reason?: string;
  }
) {
  const aggregated = aggregateStockLines(lines);

  for (const line of aggregated) {
    const productRef = db.collection("products").doc(line.productId) as DocumentReference;
    const snap = await tx.get(productRef);
    if (!snap.exists) {
      throw new Error(`Produkt „${line.name}“ nicht gefunden.`);
    }

    const data = snap.data() as ProductStockData;
    const productName = (data.name as string) || line.name;

    if (line.variantId && data.hasVariants) {
      const variants = [...(data.variants || [])];
      const index = variants.findIndex((variant) => variant.id === line.variantId);
      if (index < 0) {
        throw new Error(`Variante für „${productName}“ nicht gefunden.`);
      }

      const variant = variants[index];
      const currentStock = (variant.stock as number) ?? 0;
      const stockAfter = currentStock + line.quantity;
      variants[index] = { ...variant, stock: stockAfter };

      tx.update(productRef, {
        variants,
        stock: sumVariantStock(variants),
      });

      tx.set(db.collection("stockMovements").doc(), {
        productId: line.productId,
        variantId: line.variantId,
        productName: `${productName} – ${variant.name || "Variante"}`,
        delta: line.quantity,
        stockAfter,
        reason: meta.reason || "cancel",
        orderId: meta.orderId,
        orderNumber: meta.orderNumber,
        note: null,
        createdBy: meta.userId,
        createdAt: FieldValue.serverTimestamp(),
      });
      continue;
    }

    const currentStock = (data.stock as number) ?? 0;
    const stockAfter = currentStock + line.quantity;
    tx.update(productRef, { stock: stockAfter });
    tx.set(db.collection("stockMovements").doc(), {
      productId: line.productId,
      variantId: null,
      productName,
      delta: line.quantity,
      stockAfter,
      reason: meta.reason || "cancel",
      orderId: meta.orderId,
      orderNumber: meta.orderNumber,
      note: null,
      createdBy: meta.userId,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
}
