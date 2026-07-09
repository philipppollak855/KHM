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
  adminNavEntries,
  getCurrentNavPage,
  isNavGroupActive,
  isNavLinkActive,
  type AdminNavGroup,
} from "@/lib/admin-nav";
import { usePwaOverlayBack } from "@/hooks/usePwaBackNavigation";

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
  const defaultOpenGroups = useMemo(() => {
    const open = new Set<string>();
    for (const entry of adminNavEntries) {
      if (entry.type === "group" && isNavGroupActive(pathname, entry)) {
        open.add(entry.id);
      }
    }
    return open;
  }, [pathname]);

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
      {adminNavEntries.map((entry) => {
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const currentPage = getCurrentNavPage(pathname);

  usePwaOverlayBack(mobileOpen, "admin-menu", () => setMobileOpen(false));

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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream-dark/30">
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
          className="p-2 rounded-lg bg-forest text-cream shrink-0"
          aria-label="Kassa öffnen"
        >
          <Smartphone className="w-5 h-5" />
        </Link>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-wood-dark/60 backdrop-blur-sm"
            aria-label="Menü schließen"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[min(88vw,20rem)] max-w-xs bg-wood-dark text-cream flex flex-col shadow-2xl pt-[env(safe-area-inset-top)]">
            <div className="flex items-center justify-between p-4 border-b border-cream/10 shrink-0">
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
            <NavMenu pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter onLogout={onLogout} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

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
        <NavMenu pathname={pathname} collapsed={collapsed} />
        <SidebarFooter collapsed={collapsed} onLogout={onLogout} />
      </aside>

      <main className="flex-1 min-w-0 w-full overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
