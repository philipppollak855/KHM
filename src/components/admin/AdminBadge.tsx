import type { BadgeItem, BadgeTone } from "@/lib/badges";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-wood/8 text-stone border-wood/15",
  success: "bg-green-100 text-green-800 border-green-200/80",
  warning: "bg-amber-100 text-amber-900 border-amber-200/80",
  danger: "bg-red-100 text-red-800 border-red-200/80",
  info: "bg-forest/10 text-forest border-forest/20",
  pos: "bg-wheat/35 text-wood-dark border-wheat/60",
  online: "bg-moss/15 text-forest border-moss/30",
};

export function AdminBadge({
  label,
  tone = "neutral",
  title,
}: {
  label: string;
  tone?: BadgeTone;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full border whitespace-nowrap ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}

export function AdminBadgeList({
  badges,
  className = "",
}: {
  badges: BadgeItem[];
  className?: string;
}) {
  if (!badges.length) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {badges.map((badge) => (
        <AdminBadge
          key={badge.key}
          label={badge.label}
          tone={badge.tone}
          title={badge.title}
        />
      ))}
    </div>
  );
}
