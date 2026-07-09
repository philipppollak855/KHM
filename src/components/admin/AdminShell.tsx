"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  FileText,
  Users,
  LogOut,
  ArrowLeft,
  Truck,
  Settings,
  Boxes,
  Mail,
  Smartphone,
  AlertTriangle,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";

export const adminNav: Array<{ href: string; icon: LucideIcon; label: string }> = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/pos", icon: Smartphone, label: "Kassa (POS)" },
  { href: "/admin/bestellungen", icon: ShoppingCart, label: "Bestellungen" },
  { href: "/admin/lager", icon: Boxes, label: "Lager" },
  { href: "/admin/produkte", icon: Package, label: "Produkte" },
  { href: "/admin/kategorien", icon: FolderTree, label: "Kategorien" },
  { href: "/admin/kunden", icon: Users, label: "Kunden" },
  { href: "/admin/kontaktanfragen", icon: Mail, label: "Kontaktanfragen" },
  { href: "/admin/rechnungen", icon: FileText, label: "Rechnungen" },
  { href: "/admin/mahnungen", icon: AlertTriangle, label: "Mahnwesen" },
  { href: "/admin/versand", icon: Truck, label: "Versand" },
  { href: "/admin/einstellungen", icon: Settings, label: "Einstellungen" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
      {adminNav.map(({ href, icon: Icon, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
              collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"
            } ${
              active
                ? "bg-forest text-cream"
                : "text-cream/70 hover:bg-cream/10 hover:text-cream"
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" strokeWidth={1.75} />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  collapsed,
  onLogout,
  onNavigate,
}: {
  collapsed?: boolean;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="p-3 border-t border-cream/10 space-y-0.5 shrink-0">
      <Link
        href="/"
        onClick={onNavigate}
        title={collapsed ? "Zur Website" : undefined}
        className={`flex items-center gap-3 rounded-lg text-sm text-cream/70 hover:bg-cream/10 hover:text-cream transition-colors ${
          collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"
        }`}
      >
        <ArrowLeft className="w-5 h-5 shrink-0" />
        {!collapsed && <span>Zur Website</span>}
      </Link>
      <button
        type="button"
        onClick={onLogout}
        title={collapsed ? "Abmelden" : undefined}
        className={`flex items-center gap-3 rounded-lg text-sm text-cream/70 hover:bg-cream/10 hover:text-cream transition-colors w-full ${
          collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"
        }`}
      >
        <LogOut className="w-5 h-5 shrink-0" />
        {!collapsed && <span>Abmelden</span>}
      </button>
    </div>
  );
}

export default function AdminShell({
  children,
  onLogout,
}: {
  children: React.ReactNode;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("khm-admin-sidebar-collapsed");
      if (stored === "true") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("khm-admin-sidebar-collapsed", String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const currentPage = adminNav.find((item) => isActive(pathname, item.href));

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream-dark/30">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] bg-wood-dark text-cream border-b border-cream/10">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-cream/10"
          aria-label="Menü öffnen"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold truncate">
            {currentPage?.label || "KHM Admin"}
          </p>
          <p className="text-[10px] text-cream/50 uppercase tracking-wider">Verwaltung</p>
        </div>
        <Link
          href="/pos"
          className="p-2 rounded-lg bg-forest text-cream"
          aria-label="Kassa öffnen"
        >
          <Smartphone className="w-5 h-5" />
        </Link>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-wood-dark/60 backdrop-blur-sm"
            aria-label="Menü schließen"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[min(88vw,20rem)] max-w-xs bg-wood-dark text-cream flex flex-col shadow-2xl pt-[env(safe-area-inset-top)]">
            <div className="flex items-center justify-between p-4 border-b border-cream/10">
              <div>
                <p className="font-display text-lg font-bold">KHM Admin</p>
                <p className="text-xs text-cream/50">Verwaltungsbereich</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-cream/10"
                aria-label="Menü schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter onLogout={onLogout} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-wood-dark text-cream shrink-0 transition-[width] duration-200 ${
          collapsed ? "w-[4.5rem]" : "w-64"
        }`}
      >
        <div
          className={`border-b border-cream/10 flex items-center ${
            collapsed ? "justify-center p-4" : "justify-between p-5"
          }`}
        >
          {!collapsed && (
            <div>
              <p className="font-display text-lg font-bold">KHM Admin</p>
              <p className="text-xs text-cream/50 mt-0.5">Verwaltungsbereich</p>
            </div>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="p-2 rounded-lg hover:bg-cream/10 text-cream/70"
            aria-label={collapsed ? "Menü erweitern" : "Menü einklappen"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>
        <NavLinks pathname={pathname} collapsed={collapsed} />
        <SidebarFooter collapsed={collapsed} onLogout={onLogout} />
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
