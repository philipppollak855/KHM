"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { getUsers, getOrders, getInvoices, formatDate } from "@/lib/firestore";
import type { Invoice, Order, User } from "@/lib/types";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataTable from "@/components/admin/AdminDataTable";
import CustomerBadges from "@/components/admin/CustomerBadges";
import CustomerDetailPanel from "@/components/admin/CustomerDetailPanel";
import { buildCustomerStats } from "@/lib/badges";
import { matchesSearch } from "@/lib/search";
import { useTeamDataFilters } from "@/hooks/useTeamDataFilters";
import { usePwaOverlayBack } from "@/hooks/usePwaBackNavigation";

export default function AdminCustomersPage() {
  const { filterCustomers, filterOrders, filterInvoices } = useTeamDataFilters();
  const [customers, setCustomers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [badgeFilter, setBadgeFilter] = useState<"all" | "open" | "pos" | "online">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  const closeDetail = useCallback(() => setSelectedCustomer(null), []);
  usePwaOverlayBack(!!selectedCustomer, "customer-detail", closeDetail);

  useEffect(() => {
    Promise.all([getUsers(), getOrders(), getInvoices()])
      .then(([users, orderList, invoiceList]) => {
        const scopedOrders = filterOrders(orderList);
        setCustomers(
          filterCustomers(
            users.filter((u) => u.role === "customer"),
            orderList
          )
        );
        setOrders(scopedOrders);
        setInvoices(filterInvoices(invoiceList, orderList));
      })
      .catch(console.error);
  }, [filterCustomers, filterOrders, filterInvoices]);

  const statsByUserId = useMemo(() => {
    const map = new Map<string, ReturnType<typeof buildCustomerStats>>();
    for (const customer of customers) {
      map.set(customer.id, buildCustomerStats(customer.id, orders, invoices));
    }
    return map;
  }, [customers, orders, invoices]);

  const filteredCustomers = useMemo(
    () =>
      customers.filter((c) => {
        const stats = statsByUserId.get(c.id);
        if (badgeFilter === "open" && !(stats && stats.openInvoiceCount > 0)) return false;
        if (badgeFilter === "pos" && !(stats && stats.posOrderCount > 0)) return false;
        if (badgeFilter === "online" && !(stats && stats.onlineOrderCount > 0)) return false;

        return matchesSearch(search, [
          c.displayName,
          c.email,
          c.phone,
          c.address?.street,
          c.address?.city,
          c.address?.zip,
          c.address?.country,
          stats?.orderCount,
          stats?.openInvoiceCount,
        ]);
      }),
    [customers, search, badgeFilter, statsByUserId]
  );

  return (
    <div>
      <AdminPageHeader title="Kunden" description="Registrierte Kundenkonten mit Bestell- und Zahlungsstatus" />

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Name, E-Mail, Telefon, Ort…"
        resultCount={filteredCustomers.length}
        totalCount={customers.length}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: "all" as const, label: "Alle" },
          { id: "pos" as const, label: "POS-Kunden" },
          { id: "online" as const, label: "Webshop" },
          { id: "open" as const, label: "Offene Rechnungen" },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setBadgeFilter(id)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              badgeFilter === id
                ? "bg-forest text-linen border-forest"
                : "bg-linen text-stone border-wood/20 hover:border-forest/30"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="lg:hidden space-y-3">
        {filteredCustomers.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCustomer(c)}
            className="w-full text-left bg-cream border border-wood/10 p-4 rounded-lg hover:border-forest/30 active:bg-linen transition-colors"
          >
            <p className="font-semibold text-wood-dark">{c.displayName || "–"}</p>
            <p className="text-sm text-stone break-all">{c.email}</p>
            <CustomerBadges
              user={c}
              stats={statsByUserId.get(c.id)}
              className="mt-3"
            />
            {c.phone && <p className="text-sm text-stone mt-2">{c.phone}</p>}
            {c.address && (
              <p className="text-xs text-stone mt-2">
                {c.address.street}, {c.address.zip} {c.address.city}
              </p>
            )}
            <p className="text-xs text-stone/80 mt-2">
              Registriert {formatDate(c.createdAt)}
            </p>
          </button>
        ))}
        {filteredCustomers.length === 0 && (
          <p className="text-center text-stone py-8">
            {search ? "Keine Kunden gefunden." : "Noch keine Kunden registriert."}
          </p>
        )}
      </div>

      <div className="hidden lg:block">
        <AdminDataTable minWidth="900px">
          <table className="w-full text-sm">
            <thead className="bg-wood/5">
              <tr>
                <th className="text-left p-4 font-medium text-wood-dark">Kunde</th>
                <th className="text-left p-4 font-medium text-wood-dark">Kontakt</th>
                <th className="text-left p-4 font-medium text-wood-dark">Badges</th>
                <th className="text-left p-4 font-medium text-wood-dark">Registriert</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="border-t border-wood/10 align-top cursor-pointer hover:bg-forest/5 transition-colors"
                >
                  <td className="p-4 font-medium">{c.displayName || "–"}</td>
                  <td className="p-4">
                    <p>{c.email}</p>
                    <p className="text-xs text-stone mt-1">{c.phone || "–"}</p>
                    <p className="text-xs text-stone mt-1">
                      {c.address
                        ? `${c.address.street}, ${c.address.zip} ${c.address.city}`
                        : "Keine Adresse"}
                    </p>
                  </td>
                  <td className="p-4">
                    <CustomerBadges user={c} stats={statsByUserId.get(c.id)} />
                  </td>
                  <td className="p-4 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-wood/60">
                    {search ? "Keine Kunden gefunden." : "Noch keine Kunden registriert."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </AdminDataTable>
      </div>

      {selectedCustomer && (
        <CustomerDetailPanel
          customer={selectedCustomer}
          orders={orders}
          invoices={invoices}
          onClose={closeDetail}
        />
      )}
    </div>
  );
}
