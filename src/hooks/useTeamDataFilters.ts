"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  filterCustomersForTeamScope,
  filterInquiriesForTeamScope,
  filterInvoicesForTeamScope,
  filterOrdersForTeamScope,
  resolveTeamDataScope,
  shouldRestrictTeamData,
} from "@/lib/team-data-scope";
import type { ContactInquiry, Invoice, Order, User } from "@/lib/types";

export function useTeamDataFilters() {
  const { user } = useAuth();

  return useMemo(
    () => ({
      scope: resolveTeamDataScope(user),
      restrictToOwn: shouldRestrictTeamData(user),
      filterOrders: (orders: Order[]) => filterOrdersForTeamScope(orders, user),
      filterInvoices: (invoices: Invoice[], orders: Order[]) =>
        filterInvoicesForTeamScope(invoices, orders, user),
      filterCustomers: (customers: User[], orders: Order[]) =>
        filterCustomersForTeamScope(customers, orders, user),
      filterInquiries: (inquiries: ContactInquiry[]) =>
        filterInquiriesForTeamScope(inquiries, user),
    }),
    [user]
  );
}
