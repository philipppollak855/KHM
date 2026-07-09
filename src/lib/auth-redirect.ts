import type { User } from "@/lib/types";

export function getLoginRedirect(
  user: User | null,
  explicitRedirect?: string | null
): string {
  if (explicitRedirect) return explicitRedirect;
  return user?.role === "admin" ? "/admin" : "/konto";
}
