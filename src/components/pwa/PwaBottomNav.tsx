"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useRef } from "react";
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
import { getModuleForPath } from "@/lib/permissions";
import { useAuth } from "@/context/AuthContext";

type Tab = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  isActive: (pathname: string) => boolean;
};

const sideTabs: Tab[] = [
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

const startTab: Tab = {
  id: "start",
  label: "Start",
  icon: LayoutGrid,
  href: "/admin/start",
  isActive: (pathname) => pathname === "/admin/start",
};

function SideTabLink({ tab, pathname }: { tab: Tab; pathname: string }) {
  const Icon = tab.icon;
  const active = tab.isActive(pathname);

  return (
    <Link
      href={tab.href}
      className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 h-[3.25rem] touch-manipulation transition-colors ${
        active
          ? "bg-forest text-cream"
          : "text-cream/55 hover:text-cream hover:bg-cream/5"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.75} />
      <span className="text-[10px] font-medium leading-none">{tab.label}</span>
    </Link>
  );
}

function StartTabLink({ tab, pathname }: { tab: Tab; pathname: string }) {
  const Icon = tab.icon;
  const active = tab.isActive(pathname);

  return (
    <Link
      href={tab.href}
      className={`flex shrink-0 flex-col items-center justify-center gap-1 rounded-xl py-2 h-[3.25rem] w-[4.25rem] touch-manipulation transition-colors ${
        active
          ? "bg-forest text-cream ring-1 ring-inset ring-wheat/90"
          : "bg-linen text-forest ring-1 ring-inset ring-wheat/75 hover:bg-linen/90"
      }`}
      aria-current={active ? "page" : undefined}
      aria-label="Startbildschirm"
    >
      <Icon className="w-5 h-5" strokeWidth={active ? 2.25 : 2} />
      <span className="text-[10px] font-semibold tracking-wide leading-none">
        {tab.label}
      </span>
    </Link>
  );
}

export default function PwaBottomNav() {
  const pathname = usePathname() || "/";
  const isPwa = useIsStandalonePwa();
  const { canRead } = useAuth();
  const navRef = useRef<HTMLElement>(null);

  const canShowTab = (tab: Tab) => {
    const module = getModuleForPath(tab.href);
    return !module || canRead(module);
  };

  const { leftTabs, rightTabs, showStart } = useMemo(() => {
    const visibleSide = sideTabs.filter(canShowTab);
    const mid = Math.ceil(visibleSide.length / 2);
    const startVisible = canShowTab(startTab);

    return {
      leftTabs: visibleSide.slice(0, mid),
      rightTabs: visibleSide.slice(mid),
      showStart: startVisible,
    };
  }, [canRead]);

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
  }, [isPwa, showStart, leftTabs.length, rightTabs.length]);

  const hasSideTabs = leftTabs.length > 0 || rightTabs.length > 0;
  if (!isPwa || (!showStart && !hasSideTabs)) return null;

  return (
    <nav
      ref={navRef}
      className="pwa-bottom-nav fixed inset-x-0 bottom-0 z-40 lg:hidden"
      aria-label="Hauptnavigation"
    >
      <div className="mx-auto max-w-lg px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-wood-dark/92 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.35)] p-1.5">
          <div className="flex items-center gap-1">
            <div className="flex flex-1 gap-1 min-w-0">
              {leftTabs.map((tab) => (
                <SideTabLink key={tab.id} tab={tab} pathname={pathname} />
              ))}
            </div>

            {showStart && (
              <StartTabLink tab={startTab} pathname={pathname} />
            )}

            <div className="flex flex-1 gap-1 min-w-0">
              {rightTabs.map((tab) => (
                <SideTabLink key={tab.id} tab={tab} pathname={pathname} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export { PWA_BOTTOM_NAV_HEIGHT } from "@/lib/pwa-layout";
