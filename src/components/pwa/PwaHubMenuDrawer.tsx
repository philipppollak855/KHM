"use client";

import Link from "next/link";
import { ArrowLeft, LogOut, X } from "lucide-react";
import MobileHubNav from "@/components/admin/MobileHubNav";
import type { AdminNavHubId } from "@/lib/admin-nav";

export default function PwaHubMenuDrawer({
  open,
  focusHub,
  onClose,
  onLogout,
}: {
  open: boolean;
  focusHub: AdminNavHubId | null;
  onClose: () => void;
  onLogout: () => void;
}) {
  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-[55] flex">
      <button
        type="button"
        className="absolute inset-0 bg-wood-dark/60 backdrop-blur-sm"
        aria-label="Menü schließen"
        onClick={onClose}
      />
      <aside className="relative w-[min(92vw,22rem)] max-w-sm bg-wood-dark text-cream flex flex-col shadow-2xl pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between p-4 border-b border-cream/10 shrink-0">
          <div>
            <p className="font-display text-lg font-bold">Navigation</p>
            <p className="text-xs text-cream/50">5 Bereiche mit Unterpunkten</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-cream/10 touch-manipulation"
            aria-label="Menü schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <MobileHubNav focusHub={focusHub} onNavigate={onClose} />
        <div className="p-3 border-t border-cream/10 space-y-0.5 shrink-0">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg text-sm text-cream/70 hover:bg-cream/10 hover:text-cream transition-colors px-3 py-2.5"
          >
            <ArrowLeft className="w-5 h-5 shrink-0" />
            <span>Zur Website</span>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-3 rounded-lg text-sm text-cream/70 hover:bg-cream/10 hover:text-cream transition-colors w-full px-3 py-2.5"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Abmelden</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
