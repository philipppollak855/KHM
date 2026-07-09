"use client";

import { useEffect, useState, useMemo } from "react";
import { getInvoices, formatPrice, formatDate } from "@/lib/firestore";
import { downloadInvoicePdf } from "@/lib/documents/download";
import { confirmInvoicePayment, sendInvoiceReminder } from "@/lib/admin-api";
import type { Invoice, PaymentMethod } from "@/lib/types";
import DownloadButton from "@/components/documents/DownloadButton";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataTable from "@/components/admin/AdminDataTable";
import { AdminBadgeList } from "@/components/admin/AdminBadge";
import { getInvoiceBadges } from "@/lib/badges";
import { matchesSearch } from "@/lib/search";
import { isDateInRange, type PeriodPreset } from "@/lib/date-filters";
import { computeInvoiceReport } from "@/lib/admin-reports";
import AdminPeriodFilter, {
  getActiveDateRange,
  useDefaultCustomRange,
} from "@/components/admin/AdminPeriodFilter";
import AdminReportCards, { AdminFilterChips } from "@/components/admin/AdminReportCards";

const statusLabels: Record<Invoice["status"], string> = {
  draft: "Entwurf",
  sent: "Offen",
  paid: "Bezahlt",
  cancelled: "Storniert",
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Bar",
  card: "Karte",
  bank_transfer: "Überweisung",
};

function InvoiceStatusBadge({ inv }: { inv: Invoice }) {
  const isOverdue = inv.status === "sent" && inv.dueAt < new Date();
  return (
    <span
      className={`text-xs px-2 py-1 rounded inline-block ${
        inv.status === "paid"
          ? "bg-green-100 text-green-800"
          : inv.status === "sent"
            ? isOverdue
              ? "bg-red-100 text-red-800"
              : "bg-amber-100 text-amber-800"
            : "bg-stone/10 text-stone"
      }`}
    >
      {statusLabels[inv.status]}
    </span>
  );
}

export default function AdminInvoicesPage() {
  const defaultRange = useDefaultCustomRange();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("month");
  const [customFrom, setCustomFrom] = useState(defaultRange.from);
  const [customTo, setCustomTo] = useState(defaultRange.to);
  const [statusFilter, setStatusFilter] = useState<"all" | Invoice["status"]>("all");
  const [channelFilter, setChannelFilter] = useState<"all" | "pos" | "online">("all");
  const [loading, setLoading] = useState(true);
  const [confirmingInvoice, setConfirmingInvoice] = useState<Invoice | null>(null);
  const [reference, setReference] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setInvoices(await getInvoices());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const dateRange = useMemo(
    () => getActiveDateRange(periodPreset, customFrom, customTo),
    [periodPreset, customFrom, customTo]
  );

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((inv) => {
        if (!isDateInRange(inv.issuedAt, dateRange)) return false;
        if (statusFilter !== "all" && inv.status !== statusFilter) return false;
        const isPos = inv.orderNumber.startsWith("POS-");
        if (channelFilter === "pos" && !isPos) return false;
        if (channelFilter === "online" && isPos) return false;

        return matchesSearch(search, [
          inv.invoiceNumber,
          inv.orderNumber,
          inv.customerName,
          inv.customerEmail,
          statusLabels[inv.status],
          inv.total,
          formatPrice(inv.total),
        ]);
      }),
    [invoices, search, dateRange, statusFilter, channelFilter]
  );

  const report = useMemo(() => computeInvoiceReport(filteredInvoices), [filteredInvoices]);

  const reportCards = [
    {
      label: "Rechnungen",
      value: String(report.count),
      hint: `${report.paidCount} bezahlt · ${report.openCount} offen`,
    },
    {
      label: "Bezahlt",
      value: formatPrice(report.paidAmount),
      hint: `${report.paidCount} Rechnung(en)`,
      accent: "border-green-200/80",
    },
    {
      label: "Offen",
      value: formatPrice(report.openAmount),
      hint: `${report.openCount} Rechnung(en)`,
      accent: report.openCount > 0 ? "border-amber-200/80" : "",
    },
    {
      label: "Überfällig",
      value: String(report.overdueCount),
      hint: report.overdueCount > 0 ? formatPrice(
        filteredInvoices
          .filter((i) => i.status === "sent" && i.dueAt < new Date())
          .reduce((s, i) => s + i.total, 0)
      ) : "Keine überfälligen",
      accent: report.overdueCount > 0 ? "border-red-200/80 bg-red-50/40" : "",
    },
    {
      label: "Volumen",
      value: formatPrice(report.totalVolume),
      hint: "Ohne Stornierte",
    },
    {
      label: "POS / Webshop",
      value: `${report.posCount} / ${report.onlineCount}`,
      hint: "Rechnungen im Zeitraum",
    },
  ];

  const handleConfirmPayment = async (invoiceId: string) => {
    setActionLoading(invoiceId);
    setActionError("");
    try {
      await confirmInvoicePayment({
        invoiceId,
        reference: reference || undefined,
        notes: "Manuell bestätigt",
      });
      setConfirmingInvoice(null);
      setReference("");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Fehler");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReminder = async (inv: Invoice) => {
    if (inv.dueAt > new Date()) {
      setActionError("Mahnung erst nach Fälligkeit möglich.");
      return;
    }
    setActionLoading(inv.id);
    setActionError("");
    try {
      await sendInvoiceReminder(inv.id);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Fehler");
    } finally {
      setActionLoading(null);
    }
  };

  const renderActions = (inv: Invoice, stacked = false) => {
    const isOverdue = inv.status === "sent" && inv.dueAt < new Date();
    return (
      <div className={`flex flex-wrap gap-2 ${stacked ? "flex-col sm:flex-row" : "justify-end"}`}>
        <DownloadButton label="PDF" onClick={() => downloadInvoicePdf(inv.id)} />
        {inv.status === "sent" && (
          <>
            <button
              type="button"
              onClick={() => {
                setReference("");
                setConfirmingInvoice(inv);
              }}
              className="text-sm px-3 py-2 bg-forest text-linen rounded-lg"
            >
              Zahlung bestätigen
            </button>
            {isOverdue && (
              <button
                type="button"
                onClick={() => handleReminder(inv)}
                disabled={actionLoading === inv.id}
                className="text-sm px-3 py-2 border border-wood/20 rounded-lg disabled:opacity-50 bg-linen"
              >
                Mahnen
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <AdminPageHeader
        title="Rechnungen & Zahlungen"
        description="Zeitraum filtern, Kennzahlen auswerten und Zahlungen verwalten"
      />

      <AdminPeriodFilter
        preset={periodPreset}
        onPresetChange={setPeriodPreset}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
      />

      <AdminReportCards cards={reportCards} />

      <AdminFilterChips
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          { id: "all", label: "Alle Status" },
          { id: "paid", label: "Bezahlt" },
          { id: "sent", label: "Offen" },
          { id: "draft", label: "Entwurf" },
          { id: "cancelled", label: "Storniert" },
        ]}
      />

      <AdminFilterChips
        value={channelFilter}
        onChange={setChannelFilter}
        options={[
          { id: "all", label: "Alle Kanäle" },
          { id: "pos", label: "POS" },
          { id: "online", label: "Webshop" },
        ]}
      />

      {actionError && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-100 p-3 rounded-lg">
          {actionError}
        </p>
      )}

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Rechnungsnr., Bestellnr., Kunde…"
        resultCount={filteredInvoices.length}
        totalCount={invoices.length}
      />

      {loading ? (
        <p className="text-stone py-12 text-center">Rechnungen werden geladen…</p>
      ) : (
        <>
          <div className="lg:hidden space-y-3">
            {filteredInvoices.map((inv) => {
              const isOverdue = inv.status === "sent" && inv.dueAt < new Date();
              return (
                <article
                  key={inv.id}
                  className="bg-cream border border-wood/10 p-4 rounded-lg space-y-3"
                >
                  <div className="flex justify-between gap-3 items-start">
                    <div className="min-w-0">
                      <p className="font-semibold text-wood-dark truncate">{inv.invoiceNumber}</p>
                      <p className="text-sm text-stone truncate">{inv.customerName}</p>
                      <p className="text-xs text-stone truncate">{inv.customerEmail}</p>
                    </div>
                    <p className="font-display text-lg text-forest shrink-0">
                      {formatPrice(inv.total)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-stone">
                    <span>{formatDate(inv.issuedAt)}</span>
                    <span className={isOverdue ? "text-red-600" : ""}>
                      · Fällig {formatDate(inv.dueAt)}
                    </span>
                    {inv.paymentMethod && (
                      <span>· {paymentMethodLabels[inv.paymentMethod]}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <InvoiceStatusBadge inv={inv} />
                    <AdminBadgeList badges={getInvoiceBadges(inv)} />
                  </div>
                  {renderActions(inv, true)}
                </article>
              );
            })}
            {filteredInvoices.length === 0 && (
              <p className="text-center text-stone py-8">
                {search ? "Keine Rechnungen gefunden." : "Noch keine Rechnungen."}
              </p>
            )}
          </div>

          <div className="hidden lg:block">
            <AdminDataTable minWidth="900px">
              <table className="w-full text-sm">
                <thead className="bg-wood/5">
                  <tr>
                    <th className="text-left p-4">Nr.</th>
                    <th className="text-left p-4">Kunde</th>
                    <th className="text-left p-4">Datum / Fällig</th>
                    <th className="text-left p-4">Betrag</th>
                    <th className="text-left p-4">Zahlung</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-right p-4">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => {
                    const isOverdue = inv.status === "sent" && inv.dueAt < new Date();
                    return (
                      <tr key={inv.id} className="border-t border-wood/10">
                        <td className="p-4 font-medium">{inv.invoiceNumber}</td>
                        <td className="p-4">
                          <p>{inv.customerName}</p>
                          <p className="text-xs text-stone">{inv.customerEmail}</p>
                        </td>
                        <td className="p-4">
                          <p>{formatDate(inv.issuedAt)}</p>
                          <p className={`text-xs ${isOverdue ? "text-red-600" : "text-stone"}`}>
                            Fällig: {formatDate(inv.dueAt)}
                          </p>
                        </td>
                        <td className="p-4 font-medium">{formatPrice(inv.total)}</td>
                        <td className="p-4 text-stone">
                          {inv.paymentMethod ? paymentMethodLabels[inv.paymentMethod] : "–"}
                        </td>
                        <td className="p-4">
                          <InvoiceStatusBadge inv={inv} />
                          <AdminBadgeList badges={getInvoiceBadges(inv)} className="mt-2" />
                        </td>
                        <td className="p-4 text-right">{renderActions(inv)}</td>
                      </tr>
                    );
                  })}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone">
                        {search ? "Keine Rechnungen gefunden." : "Noch keine Rechnungen."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </AdminDataTable>
          </div>
        </>
      )}

      {confirmingInvoice && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[60]">
          <div className="bg-linen w-full sm:max-w-md p-6 border border-wood/10 shadow-xl rounded-t-2xl sm:rounded-none max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-xl mb-1">Zahlung bestätigen</h2>
            <p className="text-sm text-stone mb-4">
              {confirmingInvoice.invoiceNumber} · {confirmingInvoice.customerName} ·{" "}
              {formatPrice(confirmingInvoice.total)}
            </p>
            <input
              placeholder="Referenz / Überweisungs-ID (optional)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full border border-wood/20 rounded-lg px-3 py-3 text-base sm:text-sm mb-4"
            />
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmingInvoice(null);
                  setReference("");
                }}
                className="px-4 py-3 sm:py-2.5 border border-wood/20 rounded-lg"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => handleConfirmPayment(confirmingInvoice.id)}
                disabled={actionLoading === confirmingInvoice.id}
                className="flex-1 py-3 sm:py-2.5 bg-forest text-linen rounded-lg disabled:opacity-50"
              >
                {actionLoading === confirmingInvoice.id ? "Speichern…" : "Bestätigen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
