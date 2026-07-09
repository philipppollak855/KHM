import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore, hasAdminCredentials } from "@/lib/firebase-admin";
import {
  canReadModule,
  canWriteModule,
  isOwnerUser,
  parsePermissionsFromFirestore,
} from "@/lib/permissions";
import type { PermissionModule, TeamPermissions, UserRole } from "@/lib/types";

export interface StaffAuthContext {
  uid: string;
  role: UserRole;
  permissions?: TeamPermissions;
}

async function verifyStaffToken(req: NextRequest) {
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

    if (!userDoc.exists) {
      return {
        error: NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 403 }),
      };
    }

    const data = userDoc.data()!;
    const role = data.role as UserRole;

    if (role !== "admin" && role !== "team") {
      return {
        error: NextResponse.json(
          { error: "Keine Berechtigung für den Admin-Bereich." },
          { status: 403 }
        ),
      };
    }

    if (data.active === false) {
      return {
        error: NextResponse.json(
          { error: "Dieser Zugang ist deaktiviert." },
          { status: 403 }
        ),
      };
    }

    return {
      uid: decoded.uid,
      role,
      permissions: parsePermissionsFromFirestore(data.permissions),
    } satisfies StaffAuthContext;
  } catch {
    return {
      error: NextResponse.json({ error: "Ungültiges Token." }, { status: 401 }),
    };
  }
}

export async function requireStaffAuth(req: NextRequest) {
  return verifyStaffToken(req);
}

/** Voller Zugriff (Haupt-Admin) – z. B. Teamverwaltung */
export async function requireOwner(req: NextRequest) {
  const auth = await verifyStaffToken(req);
  if ("error" in auth && auth.error) return auth;
  if (!isOwnerUser(auth)) {
    return {
      error: NextResponse.json(
        { error: "Nur der Haupt-Admin darf diese Aktion ausführen." },
        { status: 403 }
      ),
    };
  }
  return auth;
}

export async function requireModuleRead(req: NextRequest, module: PermissionModule) {
  const auth = await verifyStaffToken(req);
  if ("error" in auth && auth.error) return auth;
  if (!canReadModule(auth, module)) {
    return {
      error: NextResponse.json(
        { error: "Keine Leseberechtigung für dieses Modul." },
        { status: 403 }
      ),
    };
  }
  return auth;
}

export async function requireModuleWrite(req: NextRequest, module: PermissionModule) {
  const auth = await verifyStaffToken(req);
  if ("error" in auth && auth.error) return auth;
  if (!canWriteModule(auth, module)) {
    return {
      error: NextResponse.json(
        { error: "Keine Schreibberechtigung für dieses Modul." },
        { status: 403 }
      ),
    };
  }
  return auth;
}

/** Bestehende APIs – mindestens Team-Zugang */
export async function requireAdmin(req: NextRequest) {
  return requireStaffAuth(req);
}
