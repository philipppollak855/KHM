import { FieldValue, Timestamp, type DocumentReference } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  buildOrderItemsFromCart,
  aggregateTaxBreakdown,
  roundCurrency,
} from "@/lib/pricing";
import type { Address, CartItem, PaymentMethod } from "@/lib/types";
import { InsufficientStockError } from "./createOrderServer";
import { resolveCartItemsServer } from "./validateCartServer";
import { normalizePosCustomerName } from "@/lib/customer-display";
import {
  createPaymentRecord,
  invoiceDueDate,
  isImmediatePayment,
} from "@/lib/payments/payments-server";

const DEFAULT_POS_ADDRESS: Address = {
  street: "Abholung vor Ort",
  city: "Puchberg am Schneeberg",
  zip: "2734",
  country: "Österreich",
};

export async function createPosOrder(data: {
  adminUserId: string;
  customerUserId?: string | null;
  customerName: string;
  customerEmail?: string;
  address?: Partial<Address>;
  cartItems: CartItem[];
  paymentMethod: PaymentMethod;
  notes?: string;
  cardReference?: string;
}) {
  if (!data.customerName?.trim() && data.customerUserId) {
    throw new Error("Kundenname ist erforderlich.");
  }
  if (data.paymentMethod === "bank_transfer" && !data.customerUserId) {
    throw new Error("Überweisung ist nur mit Kundenkonto möglich.");
  }

  const validMethods: PaymentMethod[] = ["cash", "card", "bank_transfer"];
  if (!validMethods.includes(data.paymentMethod)) {
    throw new Error("Ungültige Zahlungsart.");
  }
  if (!Array.isArray(data.cartItems) || data.cartItems.length === 0) {
    throw new Error("Warenkorb ist leer.");
  }

  const customerName = normalizePosCustomerName(
    data.customerName,
    data.customerUserId
  );
  const db = getAdminFirestore();
  const orderNumber = `POS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const invoiceNumber = `RE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const paidNow = isImmediatePayment(data.paymentMethod);

  const shippingAddress: Address = {
    street: data.address?.street || DEFAULT_POS_ADDRESS.street,
    city: data.address?.city || DEFAULT_POS_ADDRESS.city,
    zip: data.address?.zip || DEFAULT_POS_ADDRESS.zip,
    country: data.address?.country || DEFAULT_POS_ADDRESS.country,
  };

  const totalsByProduct = new Map<string, { name: string; quantity: number }>();

  const orderRef = db.collection("orders").doc();
  const invoiceRef = db.collection("invoices").doc();
  const paymentRef = db.collection("payments").doc();
  const userId = data.customerUserId || `pos-walkin-${orderRef.id}`;
  const customerEmail = data.customerEmail || "";
  let saleTotal = 0;

  await db.runTransaction(async (tx) => {
    const cartItems = await resolveCartItemsServer(tx, db, data.cartItems);
    const items = buildOrderItemsFromCart(cartItems);
    const subtotalGross = roundCurrency(items.reduce((s, i) => s + i.grossAmount, 0));
    const subtotalNet = roundCurrency(items.reduce((s, i) => s + i.netAmount, 0));
    const taxTotal = roundCurrency(items.reduce((s, i) => s + i.taxAmount, 0));
    const taxBreakdown = aggregateTaxBreakdown(items);
    const shipping = 0;
    const total = roundCurrency(subtotalGross + shipping);
    saleTotal = total;

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
      userId,
      customerName,
      customerEmail,
      items,
      subtotalNet,
      subtotalGross,
      taxTotal,
      shipping,
      total,
      orderNumber,
      status: "delivered",
      shippingAddress,
      notes: data.notes || null,
      distanceKm: null,
      stockDeducted: true,
      invoiceId: invoiceRef.id,
      channel: "pos",
      paymentMethod: data.paymentMethod,
      createdByAdmin: data.adminUserId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    tx.set(invoiceRef, {
      invoiceNumber,
      orderId: orderRef.id,
      orderNumber,
      userId,
      customerName,
      customerEmail,
      items,
      subtotalNet,
      subtotalGross,
      taxTotal,
      taxBreakdown,
      shipping,
      total,
      status: paidNow ? "paid" : "sent",
      paymentMethod: data.paymentMethod,
      shippingAddress,
      issuedAt: FieldValue.serverTimestamp(),
      dueAt: paidNow ? Timestamp.fromDate(new Date()) : invoiceDueDate(14),
      paidAt: paidNow ? FieldValue.serverTimestamp() : null,
      reminderLevel: 0,
    });

    await createPaymentRecord(tx, {
      paymentId: paymentRef.id,
      invoiceId: invoiceRef.id,
      orderId: orderRef.id,
      orderNumber,
      invoiceNumber,
      userId,
      customerName,
      customerEmail,
      amount: total,
      method: data.paymentMethod,
      status: paidNow ? "completed" : "pending",
      source: "automatic",
      reference: data.cardReference || undefined,
      notes: paidNow
        ? data.paymentMethod === "card"
          ? "SumUp Kartenzahlung"
          : "Barzahlung POS"
        : "Überweisung – offen",
      confirmedBy: paidNow ? data.adminUserId : undefined,
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
        note: "POS-Verkauf",
        createdBy: data.adminUserId,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  });

  return {
    orderId: orderRef.id,
    orderNumber,
    invoiceId: invoiceRef.id,
    invoiceNumber,
    paymentId: paymentRef.id,
    total: saleTotal,
    paymentStatus: paidNow ? ("paid" as const) : ("pending" as const),
    paymentMethod: data.paymentMethod,
  };
}
