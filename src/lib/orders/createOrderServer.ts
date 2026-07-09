import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { buildOrderItemsFromCart, aggregateTaxBreakdown, roundCurrency } from "@/lib/pricing";
import type { Address, CartItem } from "@/lib/types";
import { createPaymentRecord, invoiceDueDate } from "@/lib/payments/payments-server";
import { resolveCartItemsServer } from "./validateCartServer";
import { deductStockInTransaction } from "./stock-server";

export { InsufficientStockError } from "./stock-server";

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

    await deductStockInTransaction(
      tx,
      db,
      cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        quantity: item.quantity,
      })),
      {
        orderId: orderRef.id,
        orderNumber,
        userId: data.userId,
      }
    );

    resultOrderId = orderRef.id;
    resultInvoiceId = invoiceRef.id;
  });

  return {
    orderId: resultOrderId,
    orderNumber,
    invoiceId: resultInvoiceId,
  };
}
