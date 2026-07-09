"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePwaRootGuard, initPwaBackListener } from "@/hooks/usePwaBackNavigation";
import { isStandalonePwa } from "@/lib/pwa-history";

export default function PwaRootGuard() {
  const pathname = usePathname() || "/";
  usePwaRootGuard(pathname);

  useEffect(() => {
    if (isStandalonePwa()) {
      initPwaBackListener();
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const standalone = isStandalonePwa();

    root.style.setProperty("--pwa-safe-top", "env(safe-area-inset-top)");
    root.style.setProperty(
      "--pwa-safe-bottom",
      standalone ? "env(safe-area-inset-bottom)" : "0px"
    );

    root.classList.toggle("pwa-standalone", standalone);

    return () => {
      root.classList.remove("pwa-standalone");
    };
  }, []);

  return null;
}
