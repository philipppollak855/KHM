"use client";

import { useEffect, useState } from "react";
import { getCompanySettings, saveCompanySettings } from "@/lib/firestore";
import { DEFAULT_COMPANY } from "@/lib/company";
import type { CompanySettings } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AdminSettingsPage() {
  const [form, setForm] = useState<CompanySettings>(DEFAULT_COMPANY);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getCompanySettings().then(setForm).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await saveCompanySettings(form);
      setMessage("Einstellungen gespeichert.");
    } catch {
      setMessage("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof CompanySettings, label: string) => (
    <Input
      key={key}
      label={label}
      value={form[key] || ""}
      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
    />
  );

  return (
    <div>
      <h1 className="font-display text-3xl font-light text-wood-dark mb-2">Einstellungen</h1>
      <p className="text-stone text-sm mb-8">Firmendaten für Briefkopf auf Rechnungen und Lieferscheinen</p>

      <form onSubmit={handleSave} className="bg-cream border border-wood/10 p-6 space-y-4 max-w-2xl">
        <h2 className="font-display text-lg text-wood-dark">Firma</h2>
        {field("name", "Firmenname")}
        {field("tagline", "Untertitel")}
        {field("street", "Straße")}
        <div className="grid grid-cols-2 gap-4">
          {field("zip", "PLZ")}
          {field("city", "Ort")}
        </div>
        {field("country", "Land")}
        {field("email", "E-Mail")}
        {field("phone", "Telefon")}
        {field("website", "Website")}
        {field("uid", "UID-Nummer")}
        {field("firmenbuch", "Firmenbuch (optional)")}

        <h2 className="font-display text-lg text-wood-dark pt-4">Bankverbindung</h2>
        {field("bankName", "Bank")}
        {field("iban", "IBAN")}
        {field("bic", "BIC")}

        {message && <p className={`text-sm ${message.includes("Fehler") ? "text-red-600" : "text-green-700"}`}>{message}</p>}
        <Button type="submit" disabled={saving}>{saving ? "Speichern..." : "Speichern"}</Button>
      </form>
    </div>
  );
}
