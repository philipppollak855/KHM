"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PwaBottomNav from "@/components/pwa/PwaBottomNav";
import PwaRootGuard from "@/components/pwa/PwaRootGuard";
import { useAuth } from "@/context/AuthContext";
import { useIsStandalonePwa } from "@/hooks/useIsStandalonePwa";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const isPwa = useIsStandalonePwa();
  const isStandaloneApp =
    pathname?.startsWith("/pos") || pathname?.startsWith("/admin");
  const showPwaAdminNav = isPwa && isAdmin && !isStandaloneApp;

  if (isStandaloneApp) {
    return <>{children}</>;
  }

  return (
    <>
      <PwaRootGuard />
      <Header />
      <div className={`flex flex-col flex-1 ${showPwaAdminNav ? "pb-pwa-nav" : ""}`}>
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
      </div>
      {showPwaAdminNav && <PwaBottomNav />}
    </>
  );
}
