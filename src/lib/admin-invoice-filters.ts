import type { Invoice } from "@/lib/types";
import type { PeriodPreset } from "@/lib/date-filters";

export type InvoiceListView = "open" | "overdue";

const VALID_STATUSES: Invoice["status"][] = ["draft", "sent", "paid", "cancelled"];

const VALID_PERIODS: PeriodPreset[] = [
  "all",
  "today",
  "7d",
  "month",
  "last_month",
  "quarter",
  "year",
  "custom",
];

export function getInvoiceListHref(view: InvoiceListView) {
  const params = new URLSearchParams({
    status: "sent",
    period: "all",
  });
  if (view === "overdue") {
    params.set("overdue", "1");
  }
  return `/admin/rechnungen?${params.toString()}`;
}

export interface InvoiceListUrlFilters {
  statusFilter: "all" | Invoice["status"];
  overdueOnly: boolean;
  periodPreset: PeriodPreset;
}

export function parseInvoiceListUrlFilters(
  searchParams: URLSearchParams
): Partial<InvoiceListUrlFilters> {
  const result: Partial<InvoiceListUrlFilters> = {};
  const status = searchParams.get("status");
  const period = searchParams.get("period");
  const overdue = searchParams.get("overdue") === "1";

  if (status === "all" || (status && VALID_STATUSES.includes(status as Invoice["status"]))) {
    result.statusFilter = status as InvoiceListUrlFilters["statusFilter"];
  }

  if (period && VALID_PERIODS.includes(period as PeriodPreset)) {
    result.periodPreset = period as PeriodPreset;
  }

  if (overdue) {
    result.statusFilter = "sent";
    result.overdueOnly = true;
    if (!result.periodPreset) {
      result.periodPreset = "all";
    }
  }

  return result;
}
