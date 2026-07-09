import type { User } from "@/lib/types";
import type { CustomerStats } from "@/lib/badges";
import { getCustomerBadges } from "@/lib/badges";
import { AdminBadgeList } from "./AdminBadge";

export default function CustomerBadges({
  user,
  stats,
  className,
}: {
  user: User;
  stats?: CustomerStats;
  className?: string;
}) {
  return (
    <AdminBadgeList
      badges={getCustomerBadges(user, stats)}
      className={className}
    />
  );
}
