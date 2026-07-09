"use client";

import Link from "next/link";
import { LayoutDashboard, LayoutGrid } from "lucide-react";
import { useIsStandalonePwa } from "@/hooks/useIsStandalonePwa";

export default function PosDashboardLink({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const isPwa = useIsStandalonePwa();
  const href = isPwa ? "/admin/start" : "/admin";
  const label = isPwa ? "Start" : "Dashboard";
  const Icon = isPwa ? LayoutGrid : LayoutDashboard;

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-linen/20 text-linen/90 hover:bg-linen/10 transition-colors ${
        compact ? "p-2.5" : "px-3 py-2 text-sm"
      } ${className}`}
      aria-label={isPwa ? "Zum Startbildschirm" : "Zum Dashboard"}
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
      {!compact && <span>{label}</span>}
    </Link>
  );
}
