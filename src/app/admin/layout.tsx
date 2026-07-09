"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  FileText,
  Users,
  LogOut,
  ArrowLeft,
  Truck,
  Settings,
  Boxes,
  Mail,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const adminNav = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/bestellungen", icon: ShoppingCart, label: "Bestellungen" },
  { href: "/admin/lager", icon: Boxes, label: "Lager" },
  { href: "/admin/produkte", icon: Package, label: "Produkte" },
  { href: "/admin/kategorien", icon: FolderTree, label: "Kategorien" },
  { href: "/admin/kunden", icon: Users, label: "Kunden" },
  { href: "/admin/kontaktanfragen", icon: Mail, label: "Kontaktanfragen" },
  { href: "/admin/rechnungen", icon: FileText, label: "Rechnungen" },
  { href: "/admin/versand", icon: Truck, label: "Versand" },
  { href: "/admin/einstellungen", icon: Settings, label: "Einstellungen" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login");
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wood-dark">
        <p className="text-cream/60">Laden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-cream-dark/30">
      <aside className="w-64 bg-wood-dark text-cream shrink-0 flex flex-col">
        <div className="p-6 border-b border-cream/10">
          <p className="font-display text-lg font-bold">KHM Admin</p>
          <p className="text-xs text-cream/50 mt-1">Verwaltungsbereich</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href || (href !== "/admin" && pathname.startsWith(href))
                  ? "bg-forest text-cream"
                  : "text-cream/70 hover:bg-cream/10 hover:text-cream"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-cream/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-cream/70 hover:bg-cream/10 hover:text-cream transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zur Website
          </Link>
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-cream/70 hover:bg-cream/10 hover:text-cream transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
