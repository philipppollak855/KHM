"use client";

import { useEffect, useState } from "react";
import { getUsers, formatDate } from "@/lib/firestore";
import type { User } from "@/lib/types";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);

  useEffect(() => {
    getUsers()
      .then((users) => setCustomers(users.filter((u) => u.role === "customer")))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-wood-dark mb-8">
        Kunden
      </h1>

      <div className="bg-cream rounded-2xl border border-wood/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-wood/5">
            <tr>
              <th className="text-left p-4 font-medium text-wood-dark">Name</th>
              <th className="text-left p-4 font-medium text-wood-dark">E-Mail</th>
              <th className="text-left p-4 font-medium text-wood-dark">Telefon</th>
              <th className="text-left p-4 font-medium text-wood-dark">Registriert</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-wood/10">
                <td className="p-4 font-medium">{c.displayName || "–"}</td>
                <td className="p-4">{c.email}</td>
                <td className="p-4">{c.phone || "–"}</td>
                <td className="p-4">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-wood/60">
                  Noch keine Kunden registriert.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
