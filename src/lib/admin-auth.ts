import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore, hasAdminCredentials } from "@/lib/firebase-admin";

export async function requireAdmin(req: NextRequest) {
  if (!hasAdminCredentials()) {
    return {
      error: NextResponse.json(
        { error: "Server-Konfiguration unvollständig." },
        { status: 503 }
      ),
    };
  }

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return {
      error: NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 }),
    };
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const userDoc = await getAdminFirestore()
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
      return {
        error: NextResponse.json(
          { error: "Keine Admin-Berechtigung." },
          { status: 403 }
        ),
      };
    }

    return { uid: decoded.uid };
  } catch {
    return {
      error: NextResponse.json({ error: "Ungültiges Token." }, { status: 401 }),
    };
  }
}
