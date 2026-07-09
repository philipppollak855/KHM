import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { confirmPaymentServer } from "@/lib/payments/payments-server";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("error" in auth && auth.error) return auth.error;

  const body = await req.json();
  const invoiceId = String(body.invoiceId || "").trim();
  if (!invoiceId) {
    return NextResponse.json({ error: "Rechnungs-ID fehlt." }, { status: 400 });
  }

  try {
    const result = await confirmPaymentServer({
      invoiceId,
      adminUserId: auth.uid,
      reference: body.reference ? String(body.reference) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Zahlung konnte nicht bestätigt werden.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
