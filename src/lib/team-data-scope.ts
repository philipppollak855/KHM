import type { ContactInquiry, Invoice, Order, User } from "./types";
import { isGuestUserId } from "./guest-order";
import { isTeamUser, resolveTeamDataScope } from "./permissions";

export { resolveTeamDataScope } from "./permissions";

function isWalkInUserId(userId: string) {
  return userId.startsWith("pos-walkin-");
}

export function shouldRestrictTeamData(
  user: Pick<User, "id" | "role" | "teamDataScope"> | null | undefined
) {
  return resolveTeamDataScope(user) === "own" && isTeamUser(user);
}

export function orderOwnedByStaff(order: Order, staffId: string) {
  return order.createdByAdmin === staffId;
}

export function filterOrdersForTeamScope(
  orders: Order[],
  user: Pick<User, "id" | "role" | "teamDataScope"> | null | undefined
) {
  if (!shouldRestrictTeamData(user)) return orders;
  const staffId = user!.id;
  return orders.filter((order) => orderOwnedByStaff(order, staffId));
}

export function filterInvoicesForTeamScope(
  invoices: Invoice[],
  orders: Order[],
  user: Pick<User, "id" | "role" | "teamDataScope"> | null | undefined
) {
  if (!shouldRestrictTeamData(user)) return invoices;
  const staffId = user!.id;
  const ownOrderIds = new Set(
    orders.filter((order) => orderOwnedByStaff(order, staffId)).map((order) => order.id)
  );
  return invoices.filter((invoice) => ownOrderIds.has(invoice.orderId));
}

export function filterCustomersForTeamScope(
  customers: User[],
  orders: Order[],
  user: Pick<User, "id" | "role" | "teamDataScope" | "createdByAdmin"> | null | undefined
) {
  if (!shouldRestrictTeamData(user)) return customers;
  const staffId = user!.id;
  const linkedUserIds = new Set(
    orders
      .filter(
        (order) =>
          orderOwnedByStaff(order, staffId) &&
          !isGuestUserId(order.userId) &&
          !isWalkInUserId(order.userId)
      )
      .map((order) => order.userId)
  );

  return customers.filter(
    (customer) =>
      customer.createdByAdmin === staffId || linkedUserIds.has(customer.id)
  );
}

export function inquiryVisibleToStaff(
  inquiry: ContactInquiry,
  staffId: string
) {
  if (!inquiry.assignedToAdmin) return true;
  return inquiry.assignedToAdmin === staffId;
}

export function filterInquiriesForTeamScope(
  inquiries: ContactInquiry[],
  user: Pick<User, "id" | "role" | "teamDataScope"> | null | undefined
) {
  if (!shouldRestrictTeamData(user)) return inquiries;
  return inquiries.filter((inquiry) => inquiryVisibleToStaff(inquiry, user!.id));
}
