import type { Invoice, Order } from "@/lib/types";
import { getOrderBadges } from "@/lib/badges";
import { AdminBadgeList } from "./AdminBadge";

export default function OrderBadges({
  order,
  invoice,
  className,
}: {
  order: Order;
  invoice?: Invoice | null;
  className?: string;
}) {
  return (
    <AdminBadgeList
      badges={getOrderBadges(order, invoice)}
      className={className}
    />
  );
}
