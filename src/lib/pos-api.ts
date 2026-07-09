import { auth } from "./firebase";
import type { Address, CartItem, PaymentMethod, PosCustomer } from "./types";

async function authHeaders() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Nicht angemeldet.");
  return { Authorization: `Bearer ${token}` };
}

export async function searchPosCustomers(query: string) {
  const headers = await authHeaders();
  const res = await fetch(`/api/pos/customers?q=${encodeURIComponent(query)}`, {
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Suche fehlgeschlagen.");
  return data.customers as Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    address: Address | null;
  }>;
}

export async function createPosCustomer(data: {
  name: string;
  email?: string;
  address?: Partial<Address>;
  createAccount?: boolean;
}) {
  const headers = await authHeaders();
  const res = await fetch("/api/pos/customers", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Kunde konnte nicht angelegt werden.");
  return payload as PosCustomer & { tempPassword?: string };
}

export async function completePosSale(data: {
  customer: PosCustomer;
  cartItems: CartItem[];
  paymentMethod: PaymentMethod;
  notes?: string;
  cardReference?: string;
}) {
  const headers = await authHeaders();
  const res = await fetch("/api/pos/orders", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      customerUserId: data.customer.id,
      customerName: data.customer.name,
      customerEmail: data.customer.email,
      address: data.customer.address,
      cartItems: data.cartItems,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      cardReference: data.cardReference,
    }),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Verkauf fehlgeschlagen.");
  return payload as {
    orderId: string;
    orderNumber: string;
    invoiceId: string;
    invoiceNumber: string;
    paymentId: string;
    total: number;
    paymentStatus: "paid" | "pending";
    paymentMethod: PaymentMethod;
  };
}

export async function sendPosInvoiceEmail(invoiceId: string, email: string) {
  const headers = await authHeaders();
  const res = await fetch("/api/pos/invoice/email", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ invoiceId, email }),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "E-Mail konnte nicht gesendet werden.");
  return payload;
}
