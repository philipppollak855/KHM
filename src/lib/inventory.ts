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

type StockLine = { productId: string; name: string; quantity: number };

function applyStockChange(
  tx: Transaction,
  productId: string,
  productName: string,
  delta: number,
  reason: StockMovementReason,
  meta: { orderId?: string; orderNumber?: string; note?: string; userId: string }
) {
  const productRef = doc(db, "products", productId);
  return { productRef, productName, delta, reason, meta };
}

function commitStockChanges(
  tx: Transaction,
  changes: ReturnType<typeof applyStockChange>[],
  resolved: { id: string; stock: number; name: string }[]
) {
  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    const product = resolved[i];
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
      return {
        id: snap.id,
        stock: (data.stock as number) ?? 0,
        name: (data.name as string) || items[i].name,
      };
    });

    const changes = items.map((item) =>
      applyStockChange(tx, item.productId, item.name, -item.quantity, "order", {
        orderId,
        orderNumber,
        userId,
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
      return {
        id: snap.id,
        stock: (data.stock as number) ?? 0,
        name: (data.name as string) || lines[i].name,
      };
    });

    const changes = lines.map((item) =>
      applyStockChange(tx, item.productId, item.name, item.quantity, "cancel", {
        orderId,
        orderNumber,
        userId,
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
  const totals = new Map<string, { name: string; quantity: number }>();
  for (const item of items) {
    const existing = totals.get(item.productId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      totals.set(item.productId, { name: item.name, quantity: item.quantity });
    }
  }

  for (const [productId, { name, quantity }] of totals) {
    const snap = await getDoc(doc(db, "products", productId));
    if (!snap.exists()) {
      return { ok: false, error: `Produkt „${name}“ ist nicht mehr verfügbar.` };
    }
    const stock = (snap.data().stock as number) ?? 0;
    if (stock < quantity) {
      return {
        ok: false,
        error: `Nur noch ${stock}× „${name}“ auf Lager.`,
      };
    }
  }

  return { ok: true };
}
