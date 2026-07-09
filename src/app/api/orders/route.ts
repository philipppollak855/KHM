import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, hasAdminCredentials } from "@/lib/firebase-admin";
import {
  createOrderWithStockDeduction,
  InsufficientStockError,
} from "@/lib/orders/createOrderServer";

export async function POST(req: NextRequest) {
  if (!hasAdminCredentials()) {
    return NextResponse.json(
      { error: "Server-Konfiguration unvollständig (FIREBASE_SERVICE_ACCOUNT_KEY)." },
      { status: 503 }
    );
  }

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Ungültiges Token." }, { status: 401 });
  }

  const body = await req.json();

  if (body.userId !== uid) {
    return NextResponse.json({ error: "Zugriff verweigert." }, { status: 403 });
  }

  try {
    const result = await createOrderWithStockDeduction(body);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    const message = err instanceof Error ? err.message : "Bestellung fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
