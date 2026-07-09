"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function KontoLogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      className="inline-flex items-center gap-2 rounded-lg border border-wood/15 bg-linen px-4 py-2.5 text-sm text-wood-dark transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 touch-manipulation"
    >
      <LogOut className="h-4 w-4" strokeWidth={1.5} />
      Abmelden
    </button>
  );
}
