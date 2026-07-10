import { auth } from "./firebase";
import type { PermissionModule, TeamDataScope, TeamPermissions } from "./types";

async function authHeaders() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Nicht angemeldet.");
  return { Authorization: `Bearer ${token}` };
}

export interface TeamMemberPayload {
  id: string;
  email: string;
  displayName: string;
  role: string;
  permissions?: TeamPermissions;
  teamFullAccess?: boolean;
  teamDataScope?: TeamDataScope;
  active: boolean;
  createdAt?: string | null;
}

export async function fetchTeamMembers(): Promise<TeamMemberPayload[]> {
  const headers = await authHeaders();
  const res = await fetch("/api/admin/team", { headers });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Team konnte nicht geladen werden.");
  return payload.members as TeamMemberPayload[];
}

export async function createTeamMember(data: {
  email: string;
  displayName: string;
  password: string;
  permissions: TeamPermissions;
  teamFullAccess?: boolean;
  teamDataScope?: TeamDataScope;
}) {
  const headers = await authHeaders();
  const res = await fetch("/api/admin/team", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Team-Zugang konnte nicht erstellt werden.");
  return payload.member as TeamMemberPayload;
}

export async function updateTeamMember(data: {
  userId: string;
  displayName?: string;
  password?: string;
  permissions?: TeamPermissions;
  teamFullAccess?: boolean;
  teamDataScope?: TeamDataScope;
  active?: boolean;
}) {
  const headers = await authHeaders();
  const res = await fetch("/api/admin/team", {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Team-Zugang konnte nicht aktualisiert werden.");
  return payload.member as TeamMemberPayload;
}

export async function deleteTeamMember(userId: string) {
  const headers = await authHeaders();
  const res = await fetch("/api/admin/team", {
    method: "DELETE",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Team-Zugang konnte nicht gelöscht werden.");
}

export async function confirmInvoicePayment(data: {
  invoiceId: string;
  reference?: string;
  notes?: string;
}) {
  const headers = await authHeaders();
  const res = await fetch("/api/admin/payments/confirm", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Zahlung konnte nicht bestätigt werden.");
  return payload;
}

export async function sendInvoiceReminder(invoiceId: string) {
  const headers = await authHeaders();
  const res = await fetch("/api/admin/invoices/remind", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ invoiceId }),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Mahnung fehlgeschlagen.");
  return payload;
}
