import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { buildOrderItemsFromCart, aggregateTaxBreakdown, roundCurrency } from "@/lib/pricing";
import type { Address, CartItem } from "@/lib/types";
import { createPaymentRecord, invoiceDueDate } from "@/lib/payments/payments-server";
import { resolveCartItemsServer } from "./validateCartServer";

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

function uniqueId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function createOrderWithStockDeduction(data: {
  userId: string;
  customerName: string;
  customerEmail: string;
  cartItems: CartItem[];
  shipping: number;
  shippingAddress: Address;
  notes?: string;
  distanceKm?: number;
}) {
  const db = getAdminFirestore();
  const orderRef = db.collection("orders").doc();
  const invoiceRef = db.collection("invoices").doc();
  const paymentRef = db.collection("payments").doc();
  const orderNumber = uniqueId("KHM");
  const invoiceNumber = uniqueId("RE");

  let resultOrderId = "";
  let resultInvoiceId = "";

  await db.runTransaction(async (tx) => {
    const cartItems = await resolveCartItemsServer(tx, db, data.cartItems);
    const items = buildOrderItemsFromCart(cartItems);
    const subtotalGross = roundCurrency(items.reduce((s, i) => s + i.grossAmount, 0));
    const subtotalNet = roundCurrency(items.reduce((s, i) => s + i.netAmount, 0));
    const taxTotal = roundCurrency(items.reduce((s, i) => s + i.taxAmount, 0));
    const taxBreakdown = aggregateTaxBreakdown(items);
    const total = roundCurrency(subtotalGross + data.shipping);

    const totalsByProduct = new Map<string, { name: string; quantity: number }>();
    for (const item of cartItems) {
      const existing = totalsByProduct.get(item.productId);
      if (existing) existing.quantity += item.quantity;
      else totalsByProduct.set(item.productId, { name: item.name, quantity: item.quantity });
    }

    const productUpdates: {
      ref: DocumentReference;
      name: string;
      currentStock: number;
      deduct: number;
    }[] = [];

    for (const [productId, { name, quantity }] of totalsByProduct) {
      const productRef = db.collection("products").doc(productId);
      const snap = await tx.get(productRef);
      if (!snap.exists) throw new Error(`Produkt „${name}“ nicht gefunden.`);
      const stock = (snap.data()?.stock as number) ?? 0;
      if (stock < quantity) {
        throw new InsufficientStockError(name, stock, quantity);
      }
      productUpdates.push({
        ref: productRef,
        name: (snap.data()?.name as string) || name,
        currentStock: stock,
        deduct: quantity,
      });
    }

    tx.set(orderRef, {
      userId: data.userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      items,
      subtotalNet,
      subtotalGross,
      taxTotal,
      shipping: data.shipping,
      total,
      orderNumber,
      status: "confirmed",
      shippingAddress: data.shippingAddress,
      notes: data.notes || null,
      distanceKm: data.distanceKm || null,
      stockDeducted: true,
      invoiceId: invoiceRef.id,
      channel: "online",
      paymentMethod: "bank_transfer",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    tx.set(invoiceRef, {
      invoiceNumber,
      orderId: orderRef.id,
      orderNumber,
      userId: data.userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      items,
      subtotalNet,
      subtotalGross,
      taxTotal,
      taxBreakdown,
      shipping: data.shipping,
      total,
      status: "sent",
      paymentMethod: "bank_transfer",
      shippingAddress: data.shippingAddress,
      issuedAt: FieldValue.serverTimestamp(),
      dueAt: invoiceDueDate(14),
      reminderLevel: 0,
    });

    await createPaymentRecord(tx, {
      paymentId: paymentRef.id,
      invoiceId: invoiceRef.id,
      orderId: orderRef.id,
      orderNumber,
      invoiceNumber,
      userId: data.userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: total,
      method: "bank_transfer",
      status: "pending",
      source: "automatic",
      notes: "Online-Bestellung – Überweisung offen",
    });

    for (const update of productUpdates) {
      const newStock = update.currentStock - update.deduct;
      tx.update(update.ref, { stock: newStock });
      tx.set(db.collection("stockMovements").doc(), {
        productId: update.ref.id,
        productName: update.name,
        delta: -update.deduct,
        stockAfter: newStock,
        reason: "order",
        orderId: orderRef.id,
        orderNumber,
        note: null,
        createdBy: data.userId,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    resultOrderId = orderRef.id;
    resultInvoiceId = invoiceRef.id;
  });

  return {
    orderId: resultOrderId,
    orderNumber,
    invoiceId: resultInvoiceId,
  };
}
