import {
  LayoutDashboard,
  Smartphone,
  ShoppingCart,
  FileText,
  Package,
  Settings,
  Users,
  Mail,
  AlertTriangle,
  FolderTree,
  Boxes,
  Truck,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: AdminNavLink[];
}

export type AdminNavEntry =
  | ({ type: "link" } & AdminNavLink)
  | ({ type: "group" } & AdminNavGroup);

export const adminNavEntries: AdminNavEntry[] = [
  { type: "link", href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { type: "link", href: "/pos", icon: Smartphone, label: "Kassa (POS)" },
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
    id: "finance",
    label: "Finanzen",
    icon: FileText,
    items: [
      { href: "/admin/rechnungen", icon: FileText, label: "Rechnungen" },
      { href: "/admin/mahnungen", icon: AlertTriangle, label: "Mahnwesen" },
    ],
  },
  {
    type: "group",
    id: "catalog",
    label: "Sortiment",
    icon: Package,
    items: [
      { href: "/admin/produkte", icon: Package, label: "Produkte" },
      { href: "/admin/kategorien", icon: FolderTree, label: "Kategorien" },
      { href: "/admin/lager", icon: Boxes, label: "Lager" },
    ],
  },
  {
    type: "group",
    id: "system",
    label: "Einstellungen",
    icon: Settings,
    items: [
      { href: "/admin/versand", icon: Truck, label: "Versand" },
      { href: "/admin/einstellungen", icon: Settings, label: "Firma & Shop" },
    ],
  },
];

export function isNavLinkActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/pos") return pathname === "/pos" || pathname.startsWith("/pos/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isNavGroupActive(pathname: string, group: AdminNavGroup) {
  return group.items.some((item) => isNavLinkActive(pathname, item.href));
}

export function getAllNavLinks(): AdminNavLink[] {
  const links: AdminNavLink[] = [];
  for (const entry of adminNavEntries) {
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
