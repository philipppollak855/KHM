import type { User } from "@/lib/types";

export function getLoginRedirect(
  user: User | null,
  explicitRedirect?: string | null,
  options?: { pwa?: boolean }
): string {
  if (explicitRedirect) return explicitRedirect;
  if (user?.role === "admin") {
    return options?.pwa ? "/admin/start" : "/admin";
  }
  return "/konto";
}
