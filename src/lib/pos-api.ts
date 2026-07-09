import { auth } from "./firebase";
import type { Address, CartItem, PaymentMethod, PosCustomer } from "./types";

function apiUrl(path: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  return path;
}

async function authHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("Nicht angemeldet. Bitte erneut einloggen.");
  const token = await user.getIdToken(true);
  if (!token) throw new Error("Sitzung abgelaufen. Bitte erneut einloggen.");
  return { Authorization: `Bearer ${token}` };
}

async function parseApiResponse(res: Response) {
  const text = await res.text();
  const contentType = res.headers.get("content-type") || "";

  let data: Record<string, unknown> = {};
  if (text) {
    if (contentType.includes("application/json")) {
      try {
        data = JSON.parse(text) as Record<string, unknown>;
      } catch {
        throw new Error("Ungültige Server-Antwort (JSON).");
      }
    } else if (text.trimStart().startsWith("<!DOCTYPE") || text.trimStart().startsWith("<html")) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("Keine Berechtigung. Bitte als Admin neu anmelden.");
      }
      if (res.status === 503 || res.status === 502 || res.status === 504) {
        throw new Error(
          "Server vorübergehend nicht erreichbar. Bitte in ein paar Sekunden erneut versuchen."
        );
      }
      throw new Error(
        `Serverfehler (${res.status}). Die Kassa-API ist nicht erreichbar.`
      );
    } else {
      throw new Error(text.slice(0, 160) || `Unerwartete Antwort (${res.status}).`);
    }
  }

  if (!res.ok) {
    throw new Error(
      (typeof data.error === "string" && data.error) ||
        `Anfrage fehlgeschlagen (${res.status}).`
    );
  }

  return data;
}

export async function searchPosCustomers(query: string) {
  const headers = await authHeaders();
  const res = await fetch(
    apiUrl(`/api/pos/customers?q=${encodeURIComponent(query)}`),
    { headers, cache: "no-store" }
  );
  const data = await parseApiResponse(res);
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
  const res = await fetch(apiUrl("/api/pos/customers"), {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  const payload = await parseApiResponse(res);
  return payload as unknown as PosCustomer & { tempPassword?: string };
}

export async function completePosSale(data: {
  customer: PosCustomer;
  cartItems: CartItem[];
  paymentMethod: PaymentMethod;
  notes?: string;
  cardReference?: string;
  sellerDisplayName?: string;
}) {
  const headers = await authHeaders();
  const res = await fetch(apiUrl("/api/pos/orders"), {
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
      sellerDisplayName: data.sellerDisplayName,
    }),
    cache: "no-store",
  });
  const payload = await parseApiResponse(res);
  return payload as unknown as {
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
  const res = await fetch(apiUrl("/api/pos/invoice/email"), {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ invoiceId, email }),
    cache: "no-store",
  });
  return parseApiResponse(res);
}
