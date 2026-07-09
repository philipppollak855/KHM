import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { PaymentMethod, PaymentSource, PaymentStatus } from "@/lib/types";

export function isImmediatePayment(method: PaymentMethod): boolean {
  return method === "cash" || method === "card";
}

export async function createPaymentRecord(
  tx: FirebaseFirestore.Transaction,
  data: {
    paymentId?: string;
    invoiceId: string;
    orderId: string;
    orderNumber: string;
    invoiceNumber: string;
    userId: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    source: PaymentSource;
    reference?: string;
    notes?: string;
    confirmedBy?: string;
  }
) {
  const db = getAdminFirestore();
  const ref = data.paymentId
    ? db.collection("payments").doc(data.paymentId)
    : db.collection("payments").doc();

  const payload: Record<string, unknown> = {
    invoiceId: data.invoiceId,
    orderId: data.orderId,
    orderNumber: data.orderNumber,
    invoiceNumber: data.invoiceNumber,
    userId: data.userId,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    amount: data.amount,
    method: data.method,
    status: data.status,
    source: data.source,
    reference: data.reference || null,
    notes: data.notes || null,
    createdAt: FieldValue.serverTimestamp(),
  };

  if (data.status === "completed") {
    payload.confirmedAt = FieldValue.serverTimestamp();
    if (data.confirmedBy) payload.confirmedBy = data.confirmedBy;
  }

  tx.set(ref, payload);
  return ref.id;
}

export async function confirmPaymentServer(options: {
  invoiceId: string;
  adminUserId: string;
  reference?: string;
  notes?: string;
}) {
  const db = getAdminFirestore();
  const invoiceRef = db.collection("invoices").doc(options.invoiceId);
  const invoiceSnap = await invoiceRef.get();
  if (!invoiceSnap.exists) throw new Error("Rechnung nicht gefunden.");
  const invoice = invoiceSnap.data()!;

  if (invoice.status === "paid") {
    throw new Error("Rechnung ist bereits bezahlt.");
  }
  if (invoice.status === "cancelled") {
    throw new Error("Stornierte Rechnung kann nicht bezahlt werden.");
  }

  const paymentsSnap = await db
    .collection("payments")
    .where("invoiceId", "==", options.invoiceId)
    .where("status", "==", "pending")
    .limit(1)
    .get();

  await db.runTransaction(async (tx) => {
    tx.update(invoiceRef, {
      status: "paid",
      paidAt: FieldValue.serverTimestamp(),
      paymentMethod: invoice.paymentMethod || "bank_transfer",
    });

    if (!paymentsSnap.empty) {
      const paymentRef = paymentsSnap.docs[0].ref;
      tx.update(paymentRef, {
        status: "completed",
        source: "manual",
        reference: options.reference || null,
        notes: options.notes || null,
        confirmedBy: options.adminUserId,
        confirmedAt: FieldValue.serverTimestamp(),
      });
    } else {
      const paymentRef = db.collection("payments").doc();
      tx.set(paymentRef, {
        invoiceId: options.invoiceId,
        orderId: invoice.orderId,
        orderNumber: invoice.orderNumber,
        invoiceNumber: invoice.invoiceNumber,
        userId: invoice.userId,
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        amount: invoice.total,
        method: invoice.paymentMethod || "bank_transfer",
        status: "completed",
        source: "manual",
        reference: options.reference || null,
        notes: options.notes || null,
        confirmedBy: options.adminUserId,
        confirmedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  });

  return { invoiceId: options.invoiceId, status: "paid" as const };
}

export function invoiceDueDate(days = 14): Timestamp {
  return Timestamp.fromDate(new Date(Date.now() + days * 24 * 60 * 60 * 1000));
}
