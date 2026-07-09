import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  type Transaction,
} from "firebase/firestore";
import { db } from "./firebase";
import type { OrderItem, StockMovementReason } from "./types";
import { getCartLineKey } from "./product-variants";

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

type StockLine = {
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
};

type VariantRow = {
  id: string;
  name?: string;
  stock?: number;
  active?: boolean;
};

function sumVariantStock(variants: VariantRow[]): number {
  return variants.reduce(
    (sum, variant) =>
      variant.active === false ? sum : sum + ((variant.stock as number) ?? 0),
    0
  );
}

function applyStockChange(
  tx: Transaction,
  productId: string,
  productName: string,
  delta: number,
  reason: StockMovementReason,
  meta: {
    orderId?: string;
    orderNumber?: string;
    note?: string;
    userId: string;
    variantId?: string;
  }
) {
  const productRef = doc(db, "products", productId);
  return { productRef, productName, delta, reason, meta };
}

function commitStockChanges(
  tx: Transaction,
  changes: ReturnType<typeof applyStockChange>[],
  resolved: {
    id: string;
    stock: number;
    name: string;
    hasVariants?: boolean;
    variants?: VariantRow[];
    variantId?: string;
  }[]
) {
  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    const product = resolved[i];
    const variantId = change.meta.variantId;

    if (variantId && product.hasVariants && product.variants) {
      const variants = [...product.variants];
      const index = variants.findIndex((variant) => variant.id === variantId);
      if (index < 0) {
        throw new Error(`Variante für „${product.name}“ nicht gefunden.`);
      }

      const variant = variants[index];
      const currentStock = (variant.stock as number) ?? 0;
      const newStock = currentStock + change.delta;

      if (newStock < 0) {
        throw new InsufficientStockError(
          `${product.name} – ${variant.name || "Variante"}`,
          currentStock,
          Math.abs(change.delta)
        );
      }

      variants[index] = { ...variant, stock: newStock };
      tx.update(change.productRef, {
        variants,
        stock: sumVariantStock(variants),
      });
      tx.set(doc(collection(db, "stockMovements")), {
        productId: product.id,
        variantId,
        productName: `${product.name} – ${variant.name || "Variante"}`,
        delta: change.delta,
        stockAfter: newStock,
        reason: change.reason,
        orderId: change.meta.orderId || null,
        orderNumber: change.meta.orderNumber || null,
        note: change.meta.note || null,
        createdBy: change.meta.userId,
        createdAt: serverTimestamp(),
      });
      continue;
    }

    const newStock = product.stock + change.delta;

    if (newStock < 0) {
      throw new InsufficientStockError(
        product.name,
        product.stock,
        Math.abs(change.delta)
      );
    }

    tx.update(change.productRef, { stock: newStock });
    tx.set(doc(collection(db, "stockMovements")), {
      productId: product.id,
      variantId: null,
      productName: product.name,
      delta: change.delta,
      stockAfter: newStock,
      reason: change.reason,
      orderId: change.meta.orderId || null,
      orderNumber: change.meta.orderNumber || null,
      note: change.meta.note || null,
      createdBy: change.meta.userId,
      createdAt: serverTimestamp(),
    });
  }
}

export async function deductStockForOrder(
  orderId: string,
  orderNumber: string,
  items: StockLine[],
  userId: string
) {
  if (items.length === 0) return;

  await runTransaction(db, async (tx) => {
    const productRefs = items.map((i) => doc(db, "products", i.productId));
    const snaps = await Promise.all(productRefs.map((ref) => tx.get(ref)));

    const resolved = snaps.map((snap, i) => {
      if (!snap.exists()) {
        throw new Error(`Produkt „${items[i].name}“ nicht gefunden.`);
      }
      const data = snap.data();
      const variantId = items[i].variantId;
      if (variantId && data.hasVariants) {
        const variant = (data.variants as VariantRow[] | undefined)?.find(
          (row) => row.id === variantId
        );
        if (!variant) {
          throw new Error(`Variante für „${items[i].name}“ nicht gefunden.`);
        }
        return {
          id: snap.id,
          stock: (variant.stock as number) ?? 0,
          name: (data.name as string) || items[i].name,
          hasVariants: true,
          variants: data.variants as VariantRow[],
          variantId,
        };
      }
      return {
        id: snap.id,
        stock: (data.stock as number) ?? 0,
        name: (data.name as string) || items[i].name,
        hasVariants: Boolean(data.hasVariants),
        variants: data.variants as VariantRow[] | undefined,
      };
    });

    const changes = items.map((item) =>
      applyStockChange(tx, item.productId, item.name, -item.quantity, "order", {
        orderId,
        orderNumber,
        userId,
        variantId: item.variantId,
      })
    );

    for (let i = 0; i < resolved.length; i++) {
      if (resolved[i].stock < items[i].quantity) {
        throw new InsufficientStockError(
          resolved[i].name,
          resolved[i].stock,
          items[i].quantity
        );
      }
    }

    commitStockChanges(tx, changes, resolved);
  });
}

export async function restockOrder(
  orderId: string,
  orderNumber: string,
  items: OrderItem[],
  userId: string
) {
  const lines = items.map((i) => ({
    productId: i.productId,
    variantId: i.variantId,
    name: i.name,
    quantity: i.quantity,
  }));
  if (lines.length === 0) return;

  await runTransaction(db, async (tx) => {
    const productRefs = lines.map((i) => doc(db, "products", i.productId));
    const snaps = await Promise.all(productRefs.map((ref) => tx.get(ref)));

    const resolved = snaps.map((snap, i) => {
      if (!snap.exists()) {
        throw new Error(`Produkt „${lines[i].name}“ nicht gefunden.`);
      }
      const data = snap.data();
      const variantId = lines[i].variantId;
      if (variantId && data.hasVariants) {
        const variant = (data.variants as VariantRow[] | undefined)?.find(
          (row) => row.id === variantId
        );
        if (!variant) {
          throw new Error(`Variante für „${lines[i].name}“ nicht gefunden.`);
        }
        return {
          id: snap.id,
          stock: (variant.stock as number) ?? 0,
          name: (data.name as string) || lines[i].name,
          hasVariants: true,
          variants: data.variants as VariantRow[],
          variantId,
        };
      }
      return {
        id: snap.id,
        stock: (data.stock as number) ?? 0,
        name: (data.name as string) || lines[i].name,
        hasVariants: Boolean(data.hasVariants),
        variants: data.variants as VariantRow[] | undefined,
      };
    });

    const changes = lines.map((item) =>
      applyStockChange(tx, item.productId, item.name, item.quantity, "cancel", {
        orderId,
        orderNumber,
        userId,
        variantId: item.variantId,
      })
    );

    commitStockChanges(tx, changes, resolved);
  });
}

export async function adjustProductStock(
  productId: string,
  delta: number,
  reason: StockMovementReason,
  userId: string,
  note?: string
) {
  if (delta === 0) return;

  await runTransaction(db, async (tx) => {
    const productRef = doc(db, "products", productId);
    const snap = await tx.get(productRef);
    if (!snap.exists()) throw new Error("Produkt nicht gefunden.");

    const data = snap.data();
    const product = {
      id: snap.id,
      stock: (data.stock as number) ?? 0,
      name: (data.name as string) || "Produkt",
    };

    const changes = [
      applyStockChange(tx, productId, product.name, delta, reason, {
        userId,
        note,
      }),
    ];

    commitStockChanges(tx, changes, [product]);
  });
}

export async function validateCartStock(
  items: StockLine[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const totals = new Map<string, StockLine>();
  for (const item of items) {
    const key = getCartLineKey(item.productId, item.variantId);
    const existing = totals.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      totals.set(key, { ...item });
    }
  }

  for (const line of totals.values()) {
    const snap = await getDoc(doc(db, "products", line.productId));
    if (!snap.exists()) {
      return { ok: false, error: `Produkt „${line.name}“ ist nicht mehr verfügbar.` };
    }

    const data = snap.data();
    if (line.variantId && data.hasVariants) {
      const variant = (data.variants as VariantRow[] | undefined)?.find(
        (row) => row.id === line.variantId
      );
      if (!variant) {
        return { ok: false, error: `Variante für „${line.name}“ ist nicht mehr verfügbar.` };
      }
      const stock = (variant.stock as number) ?? 0;
      if (stock < line.quantity) {
        return {
          ok: false,
          error: `Nur noch ${stock}× „${line.name}“ auf Lager.`,
        };
      }
      continue;
    }

    const stock = (data.stock as number) ?? 0;
    if (stock < line.quantity) {
      return {
        ok: false,
        error: `Nur noch ${stock}× „${line.name}“ auf Lager.`,
      };
    }
  }

  return { ok: true };
}
