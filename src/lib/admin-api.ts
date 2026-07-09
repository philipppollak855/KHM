import { auth } from "./firebase";

async function authHeaders() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Nicht angemeldet.");
  return { Authorization: `Bearer ${token}` };
}

export async function confirmInvoicePayment(data: {
  invoiceId: string;
  reference?: string;
  notes?: string;
}) {
  const headers = await authHeaders();
  const res = await fetch("/api/admin/payments/confirm", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Zahlung konnte nicht bestätigt werden.");
  return payload;
}

export async function sendInvoiceReminder(invoiceId: string) {
  const headers = await authHeaders();
  const res = await fetch("/api/admin/invoices/remind", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ invoiceId }),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Mahnung fehlgeschlagen.");
  return payload;
}
