"use client";

import { Moon, Sun } from "lucide-react";
import { usePosTheme } from "@/hooks/usePosTheme";

export default function PosThemeToggle({ compact = false }: { compact?: boolean }) {
  const { isDark, toggleMode } = usePosTheme();

  return (
    <button
      type="button"
      onClick={toggleMode}
      className={`inline-flex items-center justify-center rounded-lg border transition-colors ${
        isDark
          ? "border-linen/20 text-linen/90 hover:bg-linen/10"
          : "border-wood/20 text-wood-dark/90 hover:bg-wood/5"
      } ${compact ? "p-2.5" : "gap-2 px-3 py-2 text-sm"}`}
      aria-label={isDark ? "Hellmodus aktivieren" : "Dunkelmodus aktivieren"}
      title={isDark ? "Hell" : "Dunkel"}
    >
      {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
      {!compact && <span>{isDark ? "Hell" : "Dunkel"}</span>}
    </button>
  );
}
