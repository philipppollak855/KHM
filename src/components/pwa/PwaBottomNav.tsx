"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  LayoutDashboard,
  ShoppingCart,
  Smartphone,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { isNavLinkActive } from "@/lib/admin-nav";
import { useIsStandalonePwa } from "@/hooks/useIsStandalonePwa";

type Tab = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  action?: "menu";
  isActive: (pathname: string) => boolean;
};

const tabs: Tab[] = [
  {
    id: "start",
    label: "Start",
    icon: LayoutGrid,
    href: "/admin/start",
    isActive: (pathname) => pathname === "/admin/start",
  },
  {
    id: "dashboard",
    label: "Übersicht",
    icon: LayoutDashboard,
    href: "/admin",
    isActive: (pathname) => pathname === "/admin",
  },
  {
    id: "orders",
    label: "Aufträge",
    icon: ShoppingCart,
    href: "/admin/bestellungen",
    isActive: (pathname) => isNavLinkActive(pathname, "/admin/bestellungen"),
  },
  {
    id: "pos",
    label: "Kassa",
    icon: Smartphone,
    href: "/pos",
    isActive: (pathname) => pathname === "/pos" || pathname.startsWith("/pos/"),
  },
  {
    id: "menu",
    label: "Menü",
    icon: Menu,
    action: "menu",
    isActive: () => false,
  },
];

export default function PwaBottomNav({
  onMenuOpen,
}: {
  onMenuOpen?: () => void;
}) {
  const pathname = usePathname() || "/";
  const isPwa = useIsStandalonePwa();

  if (!isPwa) return null;

  return (
    <nav
      className="pwa-bottom-nav fixed inset-x-0 bottom-0 z-50 lg:hidden"
      aria-label="Hauptnavigation"
    >
      <div className="mx-auto max-w-lg px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        <div className="grid grid-cols-5 gap-1 rounded-2xl border border-white/10 bg-wood-dark/92 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.35)] p-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.isActive(pathname);
            const baseClass = `flex flex-col items-center justify-center gap-1 rounded-xl py-2 min-h-[3.25rem] touch-manipulation transition-colors ${
              active
                ? "bg-forest text-cream"
                : "text-cream/55 hover:text-cream hover:bg-cream/5"
            }`;

            if (tab.action === "menu") {
              if (onMenuOpen) {
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={onMenuOpen}
                    className={baseClass}
                    aria-label="Vollständiges Menü öffnen"
                  >
                    <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.75} />
                    <span className="text-[10px] font-medium leading-none">{tab.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={tab.id}
                  href="/admin/start"
                  className={baseClass}
                  aria-label="Alle Module"
                >
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                  <span className="text-[10px] font-medium leading-none">{tab.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={tab.id}
                href={tab.href!}
                className={baseClass}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.75} />
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export const PWA_BOTTOM_NAV_HEIGHT = "5.75rem";
