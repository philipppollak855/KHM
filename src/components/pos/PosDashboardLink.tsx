import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export default function PosDashboardLink({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/admin"
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-linen/20 text-linen/90 hover:bg-linen/10 transition-colors ${
        compact ? "p-2.5" : "px-3 py-2 text-sm"
      } ${className}`}
      aria-label="Zum Dashboard"
    >
      <LayoutDashboard className="w-4 h-4 shrink-0" strokeWidth={1.75} />
      {!compact && <span>Dashboard</span>}
    </Link>
  );
}
