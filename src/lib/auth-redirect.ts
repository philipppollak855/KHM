import type { User } from "@/lib/types";

export function getAdminHomePath(options?: { pwa?: boolean }): string {
  return options?.pwa ? "/admin/start" : "/admin";
}

export function getLoginRedirect(
  user: User | null,
  explicitRedirect?: string | null,
  options?: { pwa?: boolean }
): string {
  if (explicitRedirect) return explicitRedirect;
  if (user?.role === "admin") {
    return getAdminHomePath(options);
  }
  return "/konto";
}
