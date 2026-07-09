import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createPosOrder } from "@/lib/orders/createPosOrderServer";
import { InsufficientStockError } from "@/lib/orders/createOrderServer";
import { handleRouteError, parseJsonBody } from "@/lib/api-route";
import type { Address, CartItem, PaymentMethod } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ("error" in auth && auth.error) return auth.error;

    const body = await parseJsonBody(req);
    if (body instanceof NextResponse) return body;

    const customerName = String(body.customerName || "").trim();
    if (!customerName) {
      return NextResponse.json({ error: "Kundenname fehlt." }, { status: 400 });
    }

    const cartItems = body.cartItems as CartItem[] | undefined;
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Warenkorb ist leer." }, { status: 400 });
    }

    const result = await createPosOrder({
      adminUserId: auth.uid,
      customerUserId: (body.customerUserId as string | null) ?? null,
      customerName,
      customerEmail: body.customerEmail ? String(body.customerEmail) : undefined,
      address: body.address as Partial<Address> | undefined,
      cartItems,
      paymentMethod: (body.paymentMethod || "cash") as PaymentMethod,
      notes: body.notes ? String(body.notes) : undefined,
      cardReference: body.cardReference ? String(body.cardReference) : undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return handleRouteError(err, "pos/orders POST");
  }
}
