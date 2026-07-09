import { NextRequest, NextResponse } from "next/server";
import { hasAdminCredentials } from "@/lib/firebase-admin";
import {
  createOrderWithStockDeduction,
  InsufficientStockError,
} from "@/lib/orders/createOrderServer";
import { handleRouteError, parseJsonBody } from "@/lib/api-route";
import type { Address, CartItem } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  if (!hasAdminCredentials()) {
    return NextResponse.json(
      { error: "Server-Konfiguration unvollständig." },
      { status: 503 }
    );
  }

  try {
    const body = await parseJsonBody(req);
    if (body instanceof NextResponse) return body;

    const customerName = String(body.customerName || "").trim();
    const customerEmail = String(body.customerEmail || "").trim().toLowerCase();
    const cartItems = body.cartItems as CartItem[] | undefined;
    const shipping = Number(body.shipping);
    const shippingAddress = body.shippingAddress as Address | undefined;

    if (!customerName) {
      return NextResponse.json({ error: "Name ist erforderlich." }, { status: 400 });
    }
    if (!customerEmail || !isValidEmail(customerEmail)) {
      return NextResponse.json(
        { error: "Gültige E-Mail-Adresse ist erforderlich." },
        { status: 400 }
      );
    }
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Warenkorb ist leer." }, { status: 400 });
    }
    if (!shippingAddress?.street?.trim() || !shippingAddress?.city?.trim() || !shippingAddress?.zip?.trim()) {
      return NextResponse.json({ error: "Lieferadresse ist unvollständig." }, { status: 400 });
    }
    if (!Number.isFinite(shipping) || shipping < 0) {
      return NextResponse.json({ error: "Ungültige Versandkosten." }, { status: 400 });
    }

    const result = await createOrderWithStockDeduction({
      userId: "",
      customerName,
      customerEmail,
      cartItems,
      shipping,
      shippingAddress: {
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        zip: shippingAddress.zip.trim(),
        country: shippingAddress.country?.trim() || "Österreich",
      },
      notes: body.notes ? String(body.notes) : undefined,
      distanceKm:
        body.distanceKm !== undefined && body.distanceKm !== null
          ? Number(body.distanceKm)
          : undefined,
      isGuest: true,
      paymentMethod: "qr_transfer",
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return handleRouteError(err, "orders/guest POST");
  }
}
