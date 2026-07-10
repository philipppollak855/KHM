"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PwaBottomNav from "@/components/pwa/PwaBottomNav";
import PwaRootGuard from "@/components/pwa/PwaRootGuard";
import { useAuth } from "@/context/AuthContext";
import { useIsStandalonePwa } from "@/hooks/useIsStandalonePwa";
import { usePwaBottomNavInset } from "@/hooks/usePwaBottomNavInset";
import CookieBanner from "@/components/legal/CookieBanner";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAdmin, canAccessAdmin } = useAuth();
  const isPwa = useIsStandalonePwa();
  const isStandaloneApp =
    pathname?.startsWith("/pos") || pathname?.startsWith("/admin");
  const showPwaAdminNav = isPwa && canAccessAdmin && !isStandaloneApp;

  usePwaBottomNavInset(showPwaAdminNav);

  if (isStandaloneApp) {
    return <>{children}</>;
  }

  return (
    <>
      <PwaRootGuard />
      <Header />
      <div className="flex flex-col flex-1">
        <main
          className={`flex-1 pt-[calc(5rem+env(safe-area-inset-top,0px))] ${
            showPwaAdminNav ? "pb-pwa-nav" : isPwa ? "pb-[env(safe-area-inset-bottom,0px)]" : ""
          }`}
        >
          {children}
        </main>
        <Footer className={showPwaAdminNav ? "pb-pwa-nav" : undefined} />
      </div>
      {showPwaAdminNav && <PwaBottomNav />}
      <CookieBanner />
    </>
  );
}
