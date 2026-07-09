"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ShoppingCart,
  FileText,
  Smartphone,
  Package,
  type LucideIcon,
} from "lucide-react";
import {
  getActiveNavHubId,
  isNavLinkActive,
} from "@/lib/admin-nav";
import { PWA_MOBILE_NAV_MQ } from "@/lib/pwa-layout";
import { useIsStandalonePwa } from "@/hooks/useIsStandalonePwa";

type Tab = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
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
    id: "sales",
    label: "Verkauf",
    icon: ShoppingCart,
    href: "/admin/bestellungen",
    isActive: (pathname) =>
      isNavLinkActive(pathname, "/admin/bestellungen") ||
      isNavLinkActive(pathname, "/admin/kunden") ||
      isNavLinkActive(pathname, "/admin/kontaktanfragen"),
  },
  {
    id: "invoices",
    label: "Rechnungen",
    icon: FileText,
    href: "/admin/rechnungen",
    isActive: (pathname) =>
      isNavLinkActive(pathname, "/admin/rechnungen") ||
      isNavLinkActive(pathname, "/admin/mahnungen"),
  },
  {
    id: "pos",
    label: "Kassa",
    icon: Smartphone,
    href: "/pos",
    isActive: (pathname) => pathname === "/pos" || pathname.startsWith("/pos/"),
  },
  {
    id: "shop",
    label: "Shop",
    icon: Package,
    href: "/admin/produkte",
    isActive: (pathname) => getActiveNavHubId(pathname) === "shop",
  },
];

export default function PwaBottomNav() {
  const pathname = usePathname() || "/";
  const isPwa = useIsStandalonePwa();
  const navRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const el = navRef.current;

    if (!isPwa || !el) {
      root.style.setProperty("--pwa-bottom-nav", "0px");
      return;
    }

    const mq = window.matchMedia(PWA_MOBILE_NAV_MQ);

    const syncHeight = () => {
      if (!mq.matches) {
        root.style.setProperty("--pwa-bottom-nav", "0px");
        return;
      }
      const height = Math.ceil(el.getBoundingClientRect().height);
      root.style.setProperty("--pwa-bottom-nav", `${height}px`);
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(el);
    mq.addEventListener("change", syncHeight);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", syncHeight);
      root.style.setProperty("--pwa-bottom-nav", "0px");
    };
  }, [isPwa]);

  if (!isPwa) return null;

  return (
    <nav
      ref={navRef}
      className="pwa-bottom-nav fixed inset-x-0 bottom-0 z-40 lg:hidden"
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

export { PWA_BOTTOM_NAV_HEIGHT } from "@/lib/pwa-layout";
