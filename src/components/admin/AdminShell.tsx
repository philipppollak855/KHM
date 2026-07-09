"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  ArrowLeft,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import {
  adminNavHubs,
  filterAdminNavEntries,
  getCurrentNavPage,
  getCurrentNavHubLabel,
  isNavGroupActive,
  isNavLinkActive,
  type AdminNavGroup,
  type AdminNavHubId,
} from "@/lib/admin-nav";
import { useAuth } from "@/context/AuthContext";
import { useIsStandalonePwa } from "@/hooks/useIsStandalonePwa";
import { usePwaBottomNavInset } from "@/hooks/usePwaBottomNavInset";
import { usePwaHubMenu } from "@/hooks/usePwaHubMenu";
import { useCompanyBranding } from "@/context/CompanyBrandingContext";
import CompanyLogo from "@/components/branding/CompanyLogo";
import PwaBottomNav from "@/components/pwa/PwaBottomNav";
import PwaHubMenuDrawer from "@/components/pwa/PwaHubMenuDrawer";

function NavLinkItem({
  href,
  icon: Icon,
  label,
  pathname,
  collapsed,
  nested,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  pathname: string;
  collapsed?: boolean;
  nested?: boolean;
  onNavigate?: () => void;
}) {
  const active = isNavLinkActive(pathname, href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
        collapsed ? "justify-center px-2 py-3" : nested ? "px-3 py-2 pl-10" : "px-3 py-2.5"
      } ${
        active
          ? "bg-forest text-cream"
          : "text-cream/70 hover:bg-cream/10 hover:text-cream"
      }`}
    >
      <Icon className={`shrink-0 ${nested ? "w-4 h-4" : "w-5 h-5"}`} strokeWidth={1.75} />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

function CollapsedGroupMenu({
  group,
  pathname,
  onNavigate,
}: {
  group: AdminNavGroup;
  pathname: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const active = isNavGroupActive(pathname, group);
  const Icon = group.icon;

  return (
    <div className="relative">
      <button
        type="button"
        title={group.label}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-center w-full px-2 py-3 rounded-lg text-sm transition-colors ${
          active ? "bg-forest text-cream" : "text-cream/70 hover:bg-cream/10 hover:text-cream"
        }`}
      >
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Menü schließen"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-full top-0 ml-2 z-50 min-w-[12rem] py-2 bg-wood-dark border border-cream/10 rounded-lg shadow-xl">
            <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-cream/50">
              {group.label}
            </p>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  isNavLinkActive(pathname, item.href)
                    ? "bg-forest text-cream"
                    : "text-cream/70 hover:bg-cream/10 hover:text-cream"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NavGroupSection({
  group,
  pathname,
  collapsed,
  expanded,
  onToggle,
  onNavigate,
}: {
  group: AdminNavGroup;
  pathname: string;
  collapsed?: boolean;
  expanded: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const active = isNavGroupActive(pathname, group);
  const Icon = group.icon;

  if (collapsed) {
    return <CollapsedGroupMenu group={group} pathname={pathname} onNavigate={onNavigate} />;
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          active && !expanded
            ? "bg-cream/10 text-cream"
            : "text-cream/70 hover:bg-cream/10 hover:text-cream"
        }`}
      >
        <Icon className="w-5 h-5 shrink-0" strokeWidth={1.75} />
        <span className="flex-1 text-left truncate">{group.label}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <div className="mt-0.5 space-y-0.5">
          {group.items.map((item) => (
            <NavLinkItem
              key={item.href}
              {...item}
              pathname={pathname}
              nested
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NavMenu({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { canRead } = useAuth();
  const navEntries = useMemo(
    () => filterAdminNavEntries(adminNavHubs, canRead),
    [canRead]
  );

  const defaultOpenGroups = useMemo(() => {
    const open = new Set<string>();
    for (const entry of navEntries) {
      if (entry.type === "group" && isNavGroupActive(pathname, entry)) {
        open.add(entry.id);
      }
    }
    return open;
  }, [pathname, navEntries]);

  const [openGroups, setOpenGroups] = useState<Set<string>>(defaultOpenGroups);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      for (const id of defaultOpenGroups) next.add(id);
      return next;
    });
  }, [defaultOpenGroups]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
      {navEntries.map((entry) => {
        if (entry.type === "link") {
          return (
            <NavLinkItem
              key={entry.href}
              href={entry.href}
              icon={entry.icon}
              label={entry.label}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          );
        }
        return (
          <NavGroupSection
            key={entry.id}
            group={entry}
            pathname={pathname}
            collapsed={collapsed}
            expanded={openGroups.has(entry.id)}
            onToggle={() => toggleGroup(entry.id)}
            onNavigate={onNavigate}
          />
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
  const [collapsed, setCollapsed] = useState(false);
  const isPwa = useIsStandalonePwa();
  usePwaBottomNavInset(isPwa);
  const { company } = useCompanyBranding();
  const { mobileOpen, mobileFocusHub, openMobileMenu, closeMobileMenu } = usePwaHubMenu();

  const currentPage = getCurrentNavPage(pathname);
  const currentHub = getCurrentNavHubLabel(pathname);

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

  return (
    <div className={`min-h-dvh flex flex-col lg:flex-row bg-cream-dark/30 ${isPwa ? "pwa-admin-shell" : ""}`}>
      <header className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] bg-wood-dark text-cream border-b border-cream/10">
        <button
          type="button"
          onClick={() => openMobileMenu()}
          className="p-2 -ml-2 rounded-lg hover:bg-cream/10 touch-manipulation"
          aria-label="Menü öffnen"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0 flex flex-col items-center px-1">
          <CompanyLogo variant="mark" size="sm" dark className="mb-1" />
          <p className="font-display font-semibold truncate text-sm">
            {currentPage?.label || "Admin"}
          </p>
          <p className="text-[10px] text-cream/50 uppercase tracking-wider truncate">
            {currentHub || company.name}
          </p>
        </div>
        {!isPwa ? (
          <Link
            href="/pos"
            className="p-2 rounded-lg bg-forest text-cream shrink-0 touch-manipulation"
            aria-label="Kassa öffnen"
          >
            <Smartphone className="w-5 h-5" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => openMobileMenu()}
            className="p-2 -mr-2 rounded-lg hover:bg-cream/10 touch-manipulation shrink-0"
            aria-label="Hauptmenü"
          >
            <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
          </button>
        )}
      </header>

      <PwaHubMenuDrawer
        open={mobileOpen}
        focusHub={mobileFocusHub}
        onClose={closeMobileMenu}
        onLogout={onLogout}
      />

      <aside
        className={`hidden lg:flex flex-col bg-wood-dark text-cream shrink-0 transition-[width] duration-200 ${
          collapsed ? "w-[4.5rem]" : "w-64"
        }`}
      >
        <div
          className={`border-b border-cream/10 flex items-center shrink-0 ${
            collapsed ? "justify-center p-4" : "justify-between p-5"
          }`}
        >
          {!collapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <CompanyLogo variant="mark" size="sm" dark />
              <div className="min-w-0">
                <p className="font-display text-lg font-bold truncate">{company.name}</p>
                <p className="text-xs text-cream/50 mt-0.5 truncate">Verwaltungsbereich</p>
              </div>
            </div>
          )}
          {collapsed && <CompanyLogo variant="mark" size="sm" dark />}
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
        <NavMenu pathname={pathname} collapsed={collapsed} />
        <SidebarFooter collapsed={collapsed} onLogout={onLogout} />
      </aside>

      <main className="flex-1 min-w-0 w-full overflow-x-hidden">
        <div
          className={`p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full min-w-0 ${
            isPwa ? "pb-pwa-nav lg:pb-8" : ""
          }`}
        >
          {children}
        </div>
      </main>

      <PwaBottomNav />
    </div>
  );
}
