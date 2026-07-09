"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import {
  getContactInquiries,
  updateContactInquiryStatus,
  formatDate,
} from "@/lib/firestore";
import type { ContactInquiry, ContactInquiryStatus } from "@/lib/types";
import Button from "@/components/ui/Button";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import { matchesSearch } from "@/lib/search";

const statusLabels: Record<ContactInquiryStatus, string> = {
  new: "Neu",
  read: "Gelesen",
  replied: "Beantwortet",
  archived: "Archiviert",
};

export default function AdminContactInquiriesPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [selected, setSelected] = useState<ContactInquiry | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    const data = await getContactInquiries();
    setInquiries(data);
    if (selected) {
      const updated = data.find((i) => i.id === selected.id);
      setSelected(updated || null);
    }
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const filteredInquiries = useMemo(
    () =>
      inquiries.filter((i) =>
        matchesSearch(search, [
          i.name,
          i.email,
          i.subject,
          i.message,
          statusLabels[i.status],
        ])
      ),
    [inquiries, search]
  );

  const handleSelect = async (inquiry: ContactInquiry) => {
    setSelected(inquiry);
    if (inquiry.status === "new") {
      await updateContactInquiryStatus(inquiry.id, "read");
      await load();
    }
  };

  const handleStatusChange = async (id: string, status: ContactInquiryStatus) => {
    await updateContactInquiryStatus(id, status);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="text-stone hover:text-forest flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      <div>
        <h1 className="font-display text-3xl font-light text-wood-dark mb-1">
          Kontaktanfragen
        </h1>
        <p className="text-stone text-sm">
          Nachrichten von der Kontaktseite
        </p>
      </div>

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Name, E-Mail, Betreff…"
        resultCount={filteredInquiries.length}
        totalCount={inquiries.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-linen border border-wood/10 divide-y divide-wood/10 max-h-[70vh] overflow-y-auto">
          {filteredInquiries.map((inquiry) => (
            <button
              key={inquiry.id}
              type="button"
              onClick={() => handleSelect(inquiry)}
              className={`w-full text-left p-4 hover:bg-wood/5 transition-colors ${
                selected?.id === inquiry.id ? "bg-forest/5 border-l-4 border-forest" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-wood-dark truncate">{inquiry.subject}</p>
                  <p className="text-sm text-stone truncate">{inquiry.name}</p>
                </div>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                    inquiry.status === "new"
                      ? "bg-forest/10 text-forest font-medium"
                      : "bg-wood/10 text-stone"
                  }`}
                >
                  {statusLabels[inquiry.status]}
                </span>
              </div>
              <p className="text-xs text-stone mt-1">{formatDate(inquiry.createdAt)}</p>
            </button>
          ))}
          {filteredInquiries.length === 0 && (
            <p className="p-8 text-center text-stone">
              {search ? "Keine Anfragen gefunden." : "Keine Anfragen vorhanden."}
            </p>
          )}
        </div>

        <div className="bg-linen border border-wood/10 p-6 min-h-[300px]">
          {selected ? (
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-xl font-light text-wood-dark mb-2">
                  {selected.subject}
                </h2>
                <p className="text-sm text-stone">
                  {selected.name} ·{" "}
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                    className="text-forest hover:underline"
                  >
                    {selected.email}
                  </a>
                </p>
                <p className="text-xs text-stone mt-1">{formatDate(selected.createdAt)}</p>
              </div>

              <p className="text-wood-dark leading-relaxed whitespace-pre-wrap border-t border-wood/10 pt-4">
                {selected.message}
              </p>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-wood/10">
                <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}>
                  <Button size="sm">
                    <Mail className="w-4 h-4" />
                    Antworten
                  </Button>
                </a>
                <select
                  value={selected.status}
                  onChange={(e) =>
                    handleStatusChange(selected.id, e.target.value as ContactInquiryStatus)
                  }
                  className="rounded-lg border-2 border-wood/20 bg-linen px-3 py-1.5 text-sm"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <p className="text-stone text-sm text-center py-12">
              Wählen Sie eine Anfrage aus der Liste.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
