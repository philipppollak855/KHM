"use client";

import { useLayoutEffect } from "react";
import { useIsStandalonePwa } from "@/hooks/useIsStandalonePwa";

/** Setzt den Bottom-Nav-Inset zurück, wenn inaktiv. Die Höhe misst PwaBottomNav. */
export function usePwaBottomNavInset(active: boolean) {
  const isPwa = useIsStandalonePwa();

  useLayoutEffect(() => {
    if (typeof document === "undefined") return;

    if (active && isPwa) return;

    document.documentElement.style.setProperty("--pwa-bottom-nav", "0px");
  }, [active, isPwa]);
}
