export const GUEST_ORDER_SESSION_KEY = "khm-guest-order";

export type GuestOrderConfirmation = {
  orderNumber: string;
  invoiceNumber: string;
  total: number;
  email: string;
  customerName: string;
  paymentMethod?: "qr_transfer" | "bank_transfer";
};

export function saveGuestOrderConfirmation(data: GuestOrderConfirmation) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(GUEST_ORDER_SESSION_KEY, JSON.stringify(data));
}

export function readGuestOrderConfirmation(): GuestOrderConfirmation | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(GUEST_ORDER_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GuestOrderConfirmation;
  } catch {
    return null;
  }
}

export function clearGuestOrderConfirmation() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(GUEST_ORDER_SESSION_KEY);
}

export function isGuestUserId(userId: string) {
  return userId.startsWith("guest-");
}
