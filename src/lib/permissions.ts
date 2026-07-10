import type { ModulePermission, PermissionModule, TeamDataScope, TeamPermissions, User } from "@/lib/types";

export const PERMISSION_MODULE_DEFS: {
  id: PermissionModule;
  label: string;
  description: string;
  href?: string;
  ownerOnly?: boolean;
}[] = [
  { id: "dashboard", label: "Übersicht", description: "Dashboard und Kennzahlen", href: "/admin" },
  { id: "pos", label: "Kassa", description: "POS-Verkauf", href: "/pos" },
  { id: "orders", label: "Bestellungen", description: "Aufträge verwalten", href: "/admin/bestellungen" },
  { id: "customers", label: "Kunden", description: "Kundenstammdaten", href: "/admin/kunden" },
  {
    id: "contactInquiries",
    label: "Kontaktanfragen",
    description: "Nachrichten vom Kontaktformular",
    href: "/admin/kontaktanfragen",
  },
  { id: "invoices", label: "Rechnungen", description: "Rechnungen einsehen und bearbeiten", href: "/admin/rechnungen" },
  { id: "dunning", label: "Mahnwesen", description: "Mahnungen versenden", href: "/admin/mahnungen" },
  { id: "products", label: "Produkte", description: "Sortiment pflegen", href: "/admin/produkte" },
  { id: "categories", label: "Kategorien", description: "Produktkategorien", href: "/admin/kategorien" },
  { id: "inventory", label: "Lager", description: "Bestände und Bewegungen", href: "/admin/lager" },
  { id: "shipping", label: "Versand", description: "Versandzonen", href: "/admin/versand" },
  { id: "settings", label: "Firma & Shop", description: "Einstellungen und Branding", href: "/admin/einstellungen" },
  {
    id: "team",
    label: "Team & Rechte",
    description: "Teamzugänge verwalten",
    href: "/admin/team",
    ownerOnly: true,
  },
];

export function createEmptyPermissions(): TeamPermissions {
  return Object.fromEntries(
    PERMISSION_MODULE_DEFS.filter((m) => !m.ownerOnly).map((m) => [
      m.id,
      { read: false, write: false },
    ])
  ) as TeamPermissions;
}

export function isOwnerUser(user: Pick<User, "role"> | null | undefined) {
  return user?.role === "admin";
}

export function isTeamUser(user: Pick<User, "role"> | null | undefined) {
  return user?.role === "team";
}

export function canAccessAdminArea(user: Pick<User, "role"> | null | undefined) {
  return isOwnerUser(user) || isTeamUser(user);
}

export function createFullPermissions(): TeamPermissions {
  const base = createEmptyPermissions();
  for (const key of Object.keys(base) as Array<Exclude<PermissionModule, "team">>) {
    base[key] = { read: true, write: true };
  }
  return base;
}

export function hasTeamFullAccess(
  user: Pick<User, "role" | "teamFullAccess"> | null | undefined
) {
  return isTeamUser(user) && user?.teamFullAccess === true;
}

export function resolveTeamDataScope(
  user: Pick<User, "role" | "teamDataScope"> | null | undefined
): TeamDataScope {
  if (!user || isOwnerUser(user)) return "all";
  if (!isTeamUser(user)) return "all";
  return user.teamDataScope === "own" ? "own" : "all";
}

export function canReadModule(
  user: Pick<User, "role" | "permissions" | "teamFullAccess"> | null | undefined,
  module: PermissionModule
) {
  if (!user) return false;
  if (isOwnerUser(user)) return true;
  if (!isTeamUser(user)) return false;
  if (module === "team") return false;
  if (hasTeamFullAccess(user)) return true;
  return user.permissions?.[module]?.read === true;
}

export function canWriteModule(
  user: Pick<User, "role" | "permissions" | "teamFullAccess"> | null | undefined,
  module: PermissionModule
) {
  if (!user) return false;
  if (isOwnerUser(user)) return true;
  if (!isTeamUser(user)) return false;
  if (module === "team") return false;
  if (hasTeamFullAccess(user)) return true;
  return user.permissions?.[module]?.write === true;
}

export function getModuleForPath(pathname: string): PermissionModule | null {
  if (pathname === "/admin" || pathname === "/admin/start") return "dashboard";
  if (pathname.startsWith("/pos")) return "pos";
  if (pathname.startsWith("/admin/bestellungen")) return "orders";
  if (pathname.startsWith("/admin/kunden")) return "customers";
  if (pathname.startsWith("/admin/kontaktanfragen")) return "contactInquiries";
  if (pathname.startsWith("/admin/rechnungen")) return "invoices";
  if (pathname.startsWith("/admin/mahnungen")) return "dunning";
  if (pathname.startsWith("/admin/produkte")) return "products";
  if (pathname.startsWith("/admin/kategorien")) return "categories";
  if (pathname.startsWith("/admin/lager")) return "inventory";
  if (pathname.startsWith("/admin/versand")) return "shipping";
  if (pathname.startsWith("/admin/einstellungen")) return "settings";
  if (pathname.startsWith("/admin/inhalte")) return "settings";
  if (pathname.startsWith("/admin/team")) return "team";
  return null;
}

export function getHrefForModule(module: PermissionModule) {
  return PERMISSION_MODULE_DEFS.find((m) => m.id === module)?.href;
}

export function normalizePermissions(input?: Partial<TeamPermissions>): TeamPermissions {
  const base = createEmptyPermissions();
  if (!input) return base;

  for (const def of PERMISSION_MODULE_DEFS) {
    if (def.ownerOnly) continue;
    const moduleId = def.id as Exclude<PermissionModule, "team">;
    const perm = input[moduleId];
    if (!perm) continue;
    base[moduleId] = {
      read: !!perm.read,
      write: !!perm.write && !!perm.read,
    };
  }
  return base;
}

export function sanitizePermissionsForSave(permissions: TeamPermissions): TeamPermissions {
  const normalized = normalizePermissions(permissions);
  for (const key of Object.keys(normalized) as Array<Exclude<PermissionModule, "team">>) {
    if (!normalized[key].read) {
      normalized[key].write = false;
    }
  }
  return normalized;
}

export function parsePermissionsFromFirestore(
  raw: unknown
): TeamPermissions | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  return normalizePermissions(raw as Partial<TeamPermissions>);
}

export function filterPwaLauncherPages<
  T extends { modules: { href: string }[] }
>(pages: T[], canRead: (module: PermissionModule) => boolean): T[] {
  return pages
    .map((page) => ({
      ...page,
      modules: page.modules.filter((module) => {
        const permModule = getModuleForPath(module.href);
        return !permModule || canRead(permModule);
      }),
    }))
    .filter((page) => page.modules.length > 0);
}
