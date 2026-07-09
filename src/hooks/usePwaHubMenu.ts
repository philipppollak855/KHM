"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { AdminNavHubId } from "@/lib/admin-nav";
import { usePwaOverlayBack } from "@/hooks/usePwaBackNavigation";

export function usePwaHubMenu() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileFocusHub, setMobileFocusHub] = useState<AdminNavHubId | null>(null);

  const openMobileMenu = useCallback((hub?: AdminNavHubId) => {
    setMobileFocusHub(hub ?? null);
    setMobileOpen(true);
  }, []);

  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);

  usePwaOverlayBack(mobileOpen, "admin-menu", closeMobileMenu);

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

  return {
    mobileOpen,
    mobileFocusHub,
    openMobileMenu,
    closeMobileMenu,
  };
}
