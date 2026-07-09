"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminShell from "@/components/admin/AdminShell";
import PwaRootGuard from "@/components/pwa/PwaRootGuard";
import PwaLauncherGate from "@/components/pwa/PwaLauncherGate";
import { getModuleForPath } from "@/lib/permissions";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, canAccessAdmin, canRead, loading, logout } = useAuth();
  const isLauncher = pathname === "/admin/start";
  const requiredModule = getModuleForPath(pathname || "");

  useEffect(() => {
    if (!loading && (!user || !canAccessAdmin)) {
      router.push("/login");
    }
  }, [user, canAccessAdmin, loading, router]);

  useEffect(() => {
    if (!loading && canAccessAdmin && requiredModule && !canRead(requiredModule)) {
      router.replace("/admin/start");
    }
  }, [loading, canAccessAdmin, requiredModule, canRead, router]);

  if (loading || !user || !canAccessAdmin) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-wood-dark">
        <p className="text-cream/60">Laden...</p>
      </div>
    );
  }

  if (requiredModule && !canRead(requiredModule)) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-wood-dark">
        <p className="text-cream/60">Keine Berechtigung für dieses Modul.</p>
      </div>
    );
  }

  if (isLauncher) {
    return (
      <>
        <PwaRootGuard />
        <PwaLauncherGate>{children}</PwaLauncherGate>
      </>
    );
  }

  return (
    <>
      <PwaRootGuard />
      <AdminShell onLogout={() => logout()}>{children}</AdminShell>
    </>
  );
}
