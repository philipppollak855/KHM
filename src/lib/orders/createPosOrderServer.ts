import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  buildOrderItemsFromCart,
  aggregateTaxBreakdown,
  roundCurrency,
} from "@/lib/pricing";
import type { Address, CartItem, PaymentMethod } from "@/lib/types";
import { resolveCartItemsServer } from "./validateCartServer";
import { deductStockInTransaction } from "./stock-server";
import { normalizePosCustomerName } from "@/lib/customer-display";
import {
  createPaymentRecord,
  invoiceDueDate,
  isPosImmediatePayment,
} from "@/lib/payments/payments-server";

const DEFAULT_POS_ADDRESS: Address = {
  street: "Abholung vor Ort",
  city: "Puchberg am Schneeberg",
  zip: "2734",
  country: "Österreich",
};

async function getStaffDisplayName(adminUserId: string): Promise<string> {
  const snap = await getAdminFirestore().collection("users").doc(adminUserId).get();
  const name = snap.data()?.displayName;
  return typeof name === "string" && name.trim() ? name.trim() : "Team";
}

export async function createPosOrder(data: {
  adminUserId: string;
  adminDisplayName?: string;
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

  const validMethods: PaymentMethod[] = ["cash", "card", "bank_transfer", "qr_transfer"];
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
  const paidNow = isPosImmediatePayment(data.paymentMethod);
  const staffName =
    data.adminDisplayName?.trim() || (await getStaffDisplayName(data.adminUserId));

  const shippingAddress: Address = {
    street: data.address?.street || DEFAULT_POS_ADDRESS.street,
    city: data.address?.city || DEFAULT_POS_ADDRESS.city,
    zip: data.address?.zip || DEFAULT_POS_ADDRESS.zip,
    country: data.address?.country || DEFAULT_POS_ADDRESS.country,
  };

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
      createdByAdminName: staffName,
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
          : data.paymentMethod === "qr_transfer"
            ? "QR-Code POS"
            : "Barzahlung POS"
        : "Überweisung – offen",
      confirmedBy: paidNow ? data.adminUserId : undefined,
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
        userId: data.adminUserId,
        reason: "order",
      }
    );
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
