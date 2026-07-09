import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  createPosOrder,
} from "@/lib/orders/createPosOrderServer";
import { InsufficientStockError } from "@/lib/orders/createOrderServer";
import type { CartItem, PaymentMethod } from "@/lib/types";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("error" in auth && auth.error) return auth.error;

  const body = await req.json();

  try {
    const result = await createPosOrder({
      adminUserId: auth.uid,
      customerUserId: body.customerUserId ?? null,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      address: body.address,
      cartItems: body.cartItems as CartItem[],
      paymentMethod: (body.paymentMethod || "cash") as PaymentMethod,
      notes: body.notes,
      cardReference: body.cardReference,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    const message = err instanceof Error ? err.message : "POS-Verkauf fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
