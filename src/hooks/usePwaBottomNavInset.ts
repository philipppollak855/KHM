"use client";

import { useLayoutEffect } from "react";
import { PWA_BOTTOM_NAV_HEIGHT, PWA_MOBILE_NAV_MQ } from "@/lib/pwa-layout";
import { useIsStandalonePwa } from "@/hooks/useIsStandalonePwa";

export function usePwaBottomNavInset(active: boolean) {
  const isPwa = useIsStandalonePwa();

  useLayoutEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    if (!active || !isPwa) {
      root.style.setProperty("--pwa-bottom-nav", "0px");
      return;
    }

    const mq = window.matchMedia(PWA_MOBILE_NAV_MQ);
    const applyFallback = () => {
      root.style.setProperty(
        "--pwa-bottom-nav",
        mq.matches ? PWA_BOTTOM_NAV_HEIGHT : "0px"
      );
    };

    applyFallback();
    mq.addEventListener("change", applyFallback);

    return () => {
      mq.removeEventListener("change", applyFallback);
      root.style.setProperty("--pwa-bottom-nav", "0px");
    };
  }, [active, isPwa]);
}
