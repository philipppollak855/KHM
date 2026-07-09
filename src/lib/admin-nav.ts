import {
  LayoutDashboard,
  Smartphone,
  ShoppingCart,
  FileText,
  Package,
  Users,
  Mail,
  AlertTriangle,
  FolderTree,
  Boxes,
  Truck,
  Settings,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import type { PermissionModule } from "@/lib/types";
import { getModuleForPath } from "@/lib/permissions";

export interface AdminNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export type AdminNavHubId = "sales" | "invoices" | "shop";

export interface AdminNavGroup {
  id: AdminNavHubId;
  label: string;
  icon: LucideIcon;
  items: AdminNavLink[];
}

export type AdminNavEntry =
  | ({ type: "link" } & AdminNavLink)
  | ({ type: "group" } & AdminNavGroup);

/** 5 Hauptbereiche – mobil als Hub-Navigation mit Unterpunkten */
export const adminNavHubs: AdminNavEntry[] = [
  { type: "link", href: "/admin", icon: LayoutDashboard, label: "Übersicht" },
  { type: "link", href: "/pos", icon: Smartphone, label: "Kassa" },
  {
    type: "group",
    id: "sales",
    label: "Verkauf",
    icon: ShoppingCart,
    items: [
      { href: "/admin/bestellungen", icon: ShoppingCart, label: "Bestellungen" },
      { href: "/admin/kunden", icon: Users, label: "Kunden" },
      { href: "/admin/kontaktanfragen", icon: Mail, label: "Kontaktanfragen" },
    ],
  },
  {
    type: "group",
    id: "invoices",
    label: "Rechnungen",
    icon: FileText,
    items: [
      { href: "/admin/rechnungen", icon: FileText, label: "Alle Rechnungen" },
      { href: "/admin/mahnungen", icon: AlertTriangle, label: "Mahnwesen" },
    ],
  },
  {
    type: "group",
    id: "shop",
    label: "Shop & Betrieb",
    icon: Package,
    items: [
      { href: "/admin/produkte", icon: Package, label: "Produkte" },
      { href: "/admin/kategorien", icon: FolderTree, label: "Kategorien" },
      { href: "/admin/lager", icon: Boxes, label: "Lager" },
      { href: "/admin/versand", icon: Truck, label: "Versand" },
      { href: "/admin/einstellungen", icon: Settings, label: "Firma & Shop" },
      { href: "/admin/team", icon: UserCog, label: "Team & Rechte" },
    ],
  },
];

/** @deprecated Alias – nutze adminNavHubs */
export const adminNavEntries = adminNavHubs;

export function isNavLinkActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/pos") return pathname === "/pos" || pathname.startsWith("/pos/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isNavGroupActive(pathname: string, group: AdminNavGroup) {
  return group.items.some((item) => isNavLinkActive(pathname, item.href));
}

export function isNavHubActive(pathname: string, entry: AdminNavEntry) {
  if (entry.type === "link") return isNavLinkActive(pathname, entry.href);
  return isNavGroupActive(pathname, entry);
}

export function getActiveNavHubId(pathname: string): AdminNavHubId | null {
  for (const entry of adminNavHubs) {
    if (entry.type === "group" && isNavGroupActive(pathname, entry)) {
      return entry.id;
    }
  }
  return null;
}

export function getNavGroupById(id: AdminNavHubId): AdminNavGroup | undefined {
  const entry = adminNavHubs.find((e) => e.type === "group" && e.id === id);
  return entry?.type === "group" ? entry : undefined;
}

export function getAllNavLinks(): AdminNavLink[] {
  const links: AdminNavLink[] = [];
  for (const entry of adminNavHubs) {
    if (entry.type === "link") {
      links.push(entry);
    } else {
      links.push(...entry.items);
    }
  }
  return links;
}

export function getCurrentNavPage(pathname: string): AdminNavLink | undefined {
  return getAllNavLinks().find((item) => isNavLinkActive(pathname, item.href));
}

export function getCurrentNavHubLabel(pathname: string): string | undefined {
  for (const entry of adminNavHubs) {
    if (entry.type === "group" && isNavGroupActive(pathname, entry)) {
      return entry.label;
    }
  }
  return undefined;
}

export function filterAdminNavEntries(
  entries: AdminNavEntry[],
  canRead: (module: PermissionModule) => boolean
): AdminNavEntry[] {
  return entries
    .map((entry) => {
      if (entry.type === "link") {
        const module = getModuleForPath(entry.href);
        if (module && !canRead(module)) return null;
        return entry;
      }

      const items = entry.items.filter((item) => {
        const module = getModuleForPath(item.href);
        return !module || canRead(module);
      });

      if (items.length === 0) return null;
      return { ...entry, items };
    })
    .filter((entry): entry is AdminNavEntry => entry !== null);
}
