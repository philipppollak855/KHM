"use client";

import { useEffect, useState, useMemo } from "react";
import { getUsers, formatDate } from "@/lib/firestore";
import type { User } from "@/lib/types";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import { matchesSearch } from "@/lib/search";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getUsers()
      .then((users) => setCustomers(users.filter((u) => u.role === "customer")))
      .catch(console.error);
  }, []);

  const filteredCustomers = useMemo(
    () =>
      customers.filter((c) =>
        matchesSearch(search, [
          c.displayName,
          c.email,
          c.phone,
          c.address?.street,
          c.address?.city,
          c.address?.zip,
          c.address?.country,
        ])
      ),
    [customers, search]
  );

  return (
    <div>
      <h1 className="font-display text-3xl font-light text-wood-dark mb-2">Kunden</h1>
      <p className="text-stone text-sm mb-6">Registrierte Kundenkonten</p>

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Name, E-Mail, Telefon, Ort…"
        resultCount={filteredCustomers.length}
        totalCount={customers.length}
      />

      <div className="bg-cream rounded-2xl border border-wood/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-wood/5">
            <tr>
              <th className="text-left p-4 font-medium text-wood-dark">Name</th>
              <th className="text-left p-4 font-medium text-wood-dark">E-Mail</th>
              <th className="text-left p-4 font-medium text-wood-dark">Telefon</th>
              <th className="text-left p-4 font-medium text-wood-dark">Adresse</th>
              <th className="text-left p-4 font-medium text-wood-dark">Registriert</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="border-t border-wood/10">
                <td className="p-4 font-medium">{c.displayName || "–"}</td>
                <td className="p-4">{c.email}</td>
                <td className="p-4">{c.phone || "–"}</td>
                <td className="p-4 text-stone text-xs">
                  {c.address
                    ? `${c.address.street}, ${c.address.zip} ${c.address.city}`
                    : "–"}
                </td>
                <td className="p-4">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-wood/60">
                  {search ? "Keine Kunden gefunden." : "Noch keine Kunden registriert."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
