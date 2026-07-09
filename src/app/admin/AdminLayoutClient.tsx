"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminShell from "@/components/admin/AdminShell";
import PwaRootGuard from "@/components/pwa/PwaRootGuard";
import PwaLauncherGate from "@/components/pwa/PwaLauncherGate";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, loading, logout } = useAuth();
  const isLauncher = pathname === "/admin/start";

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login");
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-wood-dark">
        <p className="text-cream/60">Laden...</p>
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
