import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";
import { handleRouteError, parseJsonBody } from "@/lib/api-route";
import type { Address } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UserDoc = {
  id: string;
  role?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  address?: Address | null;
};

function toUserDoc(id: string, data: FirebaseFirestore.DocumentData): UserDoc {
  return { id, ...data } as UserDoc;
}

function normalizeSearch(q: string) {
  return q.trim().toLowerCase();
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ("error" in auth && auth.error) return auth.error;

    const q = normalizeSearch(req.nextUrl.searchParams.get("q") || "");
    const snap = await getAdminFirestore()
      .collection("users")
      .where("role", "==", "customer")
      .limit(100)
      .get();

    const customers = snap.docs
      .map((d) => toUserDoc(d.id, d.data()))
      .filter((u) => {
        if (!q) return true;
        const haystack = [
          u.displayName,
          u.email,
          u.phone,
          u.address?.street,
          u.address?.city,
          u.address?.zip,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 20)
      .map((u) => ({
        id: u.id,
        name: u.displayName || u.email || "",
        email: u.email || "",
        phone: u.phone || "",
        address: u.address || null,
      }));

    return NextResponse.json({ customers });
  } catch (err) {
    return handleRouteError(err, "pos/customers GET");
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ("error" in auth && auth.error) return auth.error;

    const body = await parseJsonBody(req);
    if (body instanceof NextResponse) return body;

    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const createAccount = Boolean(body.createAccount);

    if (!name) {
      return NextResponse.json({ error: "Name ist erforderlich." }, { status: 400 });
    }

    const db = getAdminFirestore();
    const address = body.address
      ? {
          street: String((body.address as Address).street || ""),
          city: String((body.address as Address).city || ""),
          zip: String((body.address as Address).zip || ""),
          country: String((body.address as Address).country || "Österreich"),
        }
      : undefined;

    if (email) {
      const existing = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!existing.empty) {
        const doc = existing.docs[0];
        const data = doc.data();
        if (address) {
          await doc.ref.update({ address, displayName: name });
        }
        return NextResponse.json({
          id: doc.id,
          name: data.displayName || name,
          email: data.email,
          address: address || data.address || null,
          isWalkIn: false,
          isNewAccount: false,
        });
      }

      if (createAccount) {
        const password = `Khm${Math.random().toString(36).slice(2, 10)}!`;
        const userRecord = await getAdminAuth().createUser({
          email,
          password,
          displayName: name,
        });

        await db.collection("users").doc(userRecord.uid).set({
          email,
          displayName: name,
          role: "customer",
          address: address || null,
          createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
          id: userRecord.uid,
          name,
          email,
          address: address || null,
          isWalkIn: false,
          isNewAccount: true,
          tempPassword: password,
        });
      }
    }

    return NextResponse.json({
      id: null,
      name,
      email,
      address: address || null,
      isWalkIn: true,
      isNewAccount: false,
    });
  } catch (err) {
    return handleRouteError(err, "pos/customers POST");
  }
}
