"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PwaRootGuard from "@/components/pwa/PwaRootGuard";
import PwaBottomNav from "@/components/pwa/PwaBottomNav";
import { usePwaBottomNavInset } from "@/hooks/usePwaBottomNavInset";
import { usePosTheme } from "@/hooks/usePosTheme";

export default function PosLayoutGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, canAccessAdmin, canRead, loading } = useAuth();
  const { isDark, t } = usePosTheme();

  usePwaBottomNavInset(!loading && canAccessAdmin && canRead("pos"));

  useEffect(() => {
    if (!loading && (!user || !canAccessAdmin)) {
      router.replace("/login?redirect=/pos");
      return;
    }
    if (!loading && canAccessAdmin && !canRead("pos")) {
      router.replace("/admin/start");
    }
  }, [user, canAccessAdmin, canRead, loading, router]);

  if (loading || !user || !canAccessAdmin || !canRead("pos")) {
    return (
      <div
        data-theme={isDark ? "dark" : "light"}
        className={`min-h-dvh flex items-center justify-center pwa-pos-shell ${t.shell}`}
      >
        <p className={t.textMuted}>Kassa wird geladen…</p>
      </div>
    );
  }

  return (
    <>
      <PwaRootGuard />
      <div
        data-theme={isDark ? "dark" : "light"}
        className={`min-h-dvh pwa-pos-shell pb-pwa-nav lg:pb-0 ${t.shell}`}
      >
        {children}
      </div>
      <PwaBottomNav />
    </>
  );
}
