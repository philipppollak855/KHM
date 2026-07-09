export const POS_WALK_IN_UI_LABEL = "Verkauf vor Ort";

const GENERIC_POS_NAMES = new Set([
  "laufkunde",
  "walk-in",
  "walkin",
  "verkauf vor ort",
]);

export function isPosWalkInUserId(userId?: string | null) {
  return !!userId?.startsWith("pos-walkin-");
}

export function isGenericPosCustomerName(name?: string | null) {
  const trimmed = name?.trim();
  if (!trimmed) return true;
  return GENERIC_POS_NAMES.has(trimmed.toLowerCase());
}

/** Kein persönlicher Name für Dokumente (Rechnung, Auftragsbestätigung, E-Mail). */
export function isDocumentAnonymousCustomer(
  name?: string | null,
  userId?: string | null
) {
  if (isPosWalkInUserId(userId)) return true;
  return isGenericPosCustomerName(name);
}

export function resolveDocumentCustomerName(
  name?: string | null,
  userId?: string | null
): string | null {
  if (isDocumentAnonymousCustomer(name, userId)) return null;
  return name?.trim() || null;
}

export function resolveDocumentSalutation(
  name?: string | null,
  userId?: string | null
): string {
  const resolved = resolveDocumentCustomerName(name, userId);
  if (!resolved) return "Guten Tag,";
  return `Sehr geehrte/r ${resolved},`;
}

export function normalizePosCustomerName(
  name: string,
  customerUserId?: string | null
): string {
  const trimmed = name.trim();
  if (!customerUserId && isGenericPosCustomerName(trimmed)) return "";
  return trimmed;
}

export function formatAdminCustomerName(name: string, userId?: string) {
  const trimmed = name?.trim();
  if (trimmed && !isGenericPosCustomerName(trimmed)) return trimmed;
  if (isPosWalkInUserId(userId)) return POS_WALK_IN_UI_LABEL;
  if (trimmed) return trimmed;
  return "–";
}
