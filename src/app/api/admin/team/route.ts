import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";
import { requireOwner } from "@/lib/admin-auth";
import { handleRouteError, parseJsonBody } from "@/lib/api-route";
import { normalizePermissions, sanitizePermissionsForSave, createFullPermissions } from "@/lib/permissions";
import type { TeamDataScope, TeamPermissions } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mapTeamMember(id: string, data: FirebaseFirestore.DocumentData) {
  return {
    id,
    email: data.email as string,
    displayName: data.displayName as string,
    role: data.role as string,
    permissions: data.permissions as TeamPermissions | undefined,
    teamFullAccess: data.teamFullAccess === true,
    teamDataScope: (data.teamDataScope === "own" ? "own" : "all") as TeamDataScope,
    active: data.active !== false,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
  };
}

function parseTeamAccess(body: Record<string, unknown>) {
  const teamFullAccess = body.teamFullAccess === true;
  const teamDataScope: TeamDataScope =
    body.teamDataScope === "own" ? "own" : "all";
  const permissions = sanitizePermissionsForSave(
    normalizePermissions(
      (teamFullAccess
        ? createFullPermissions()
        : body.permissions) as Partial<TeamPermissions> | undefined
    )
  );
  return { teamFullAccess, teamDataScope, permissions };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireOwner(req);
    if ("error" in auth && auth.error) return auth.error;

    const snap = await getAdminFirestore()
      .collection("users")
      .where("role", "in", ["admin", "team"])
      .get();

    const members = snap.docs
      .map((doc) => mapTeamMember(doc.id, doc.data()))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, "de"));

    return NextResponse.json({ members });
  } catch (err) {
    return handleRouteError(err, "admin/team GET");
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireOwner(req);
    if ("error" in auth && auth.error) return auth.error;

    const body = await parseJsonBody(req);
    if (body instanceof NextResponse) return body;

    const email = String(body.email || "").trim().toLowerCase();
    const displayName = String(body.displayName || "").trim();
    const password = String(body.password || "");
    const { teamFullAccess, teamDataScope, permissions } = parseTeamAccess(body);

    if (!email || !displayName || password.length < 8) {
      return NextResponse.json(
        { error: "E-Mail, Name und Passwort (min. 8 Zeichen) sind erforderlich." },
        { status: 400 }
      );
    }

    const created = await getAdminAuth().createUser({
      email,
      password,
      displayName,
    });

    await getAdminFirestore().collection("users").doc(created.uid).set({
      email,
      displayName,
      role: "team",
      permissions,
      teamFullAccess,
      teamDataScope,
      active: true,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      member: {
        id: created.uid,
        email,
        displayName,
        role: "team",
        permissions,
        teamFullAccess,
        teamDataScope,
        active: true,
      },
    });
  } catch (err) {
    return handleRouteError(err, "admin/team POST");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireOwner(req);
    if ("error" in auth && auth.error) return auth.error;

    const body = await parseJsonBody(req);
    if (body instanceof NextResponse) return body;

    const userId = String(body.userId || "");
    if (!userId) {
      return NextResponse.json({ error: "Benutzer-ID fehlt." }, { status: 400 });
    }

    const userRef = getAdminFirestore().collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });
    }

    const data = userDoc.data()!;
    if (data.role !== "team") {
      return NextResponse.json(
        { error: "Nur Team-Zugänge können hier bearbeitet werden." },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (body.displayName !== undefined) {
      const displayName = String(body.displayName).trim();
      if (!displayName) {
        return NextResponse.json({ error: "Name darf nicht leer sein." }, { status: 400 });
      }
      updates.displayName = displayName;
      await getAdminAuth().updateUser(userId, { displayName });
    }

    if (body.password !== undefined) {
      const password = String(body.password);
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Passwort muss mindestens 8 Zeichen haben." },
          { status: 400 }
        );
      }
      await getAdminAuth().updateUser(userId, { password });
    }

    if (
      body.permissions !== undefined ||
      body.teamFullAccess !== undefined ||
      body.teamDataScope !== undefined
    ) {
      const access = parseTeamAccess({
        permissions: body.permissions ?? data.permissions,
        teamFullAccess:
          body.teamFullAccess !== undefined ? body.teamFullAccess : data.teamFullAccess,
        teamDataScope:
          body.teamDataScope !== undefined ? body.teamDataScope : data.teamDataScope,
      });
      updates.permissions = access.permissions;
      updates.teamFullAccess = access.teamFullAccess;
      updates.teamDataScope = access.teamDataScope;
    }

    if (body.active !== undefined) {
      updates.active = !!body.active;
      await getAdminAuth().updateUser(userId, { disabled: !body.active });
    }

    if (Object.keys(updates).length > 0) {
      await userRef.update(updates);
    }

    const updated = await userRef.get();
    return NextResponse.json({ member: mapTeamMember(updated.id, updated.data()!) });
  } catch (err) {
    return handleRouteError(err, "admin/team PATCH");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireOwner(req);
    if ("error" in auth && auth.error) return auth.error;

    const body = await parseJsonBody(req);
    if (body instanceof NextResponse) return body;

    const userId = String(body.userId || "");
    if (!userId) {
      return NextResponse.json({ error: "Benutzer-ID fehlt." }, { status: 400 });
    }
    if (userId === auth.uid) {
      return NextResponse.json(
        { error: "Der eigene Zugang kann nicht gelöscht werden." },
        { status: 400 }
      );
    }

    const userRef = getAdminFirestore().collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists || userDoc.data()?.role !== "team") {
      return NextResponse.json({ error: "Team-Zugang nicht gefunden." }, { status: 404 });
    }

    await userRef.delete();
    await getAdminAuth().deleteUser(userId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleRouteError(err, "admin/team DELETE");
  }
}
