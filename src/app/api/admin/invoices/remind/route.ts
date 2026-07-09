import { NextRequest, NextResponse } from "next/server";
import { requireModuleWrite } from "@/lib/admin-auth";
import { sendManualReminder } from "@/lib/payments/dunning-server";

export async function POST(req: NextRequest) {
  const auth = await requireModuleWrite(req, "dunning");
  if ("error" in auth && auth.error) return auth.error;

  const body = await req.json();
  const invoiceId = String(body.invoiceId || "").trim();
  if (!invoiceId) {
    return NextResponse.json({ error: "Rechnungs-ID fehlt." }, { status: 400 });
  }

  try {
    const result = await sendManualReminder(invoiceId, auth.uid);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mahnung fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
