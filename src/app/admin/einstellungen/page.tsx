"use client";

import { useEffect, useState } from "react";
import { getCompanySettings, saveCompanySettings } from "@/lib/firestore";
import { DEFAULT_COMPANY } from "@/lib/company";
import type { CompanySettings } from "@/lib/types";
import { useCompanyBranding } from "@/context/CompanyBrandingContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ImageUpload from "@/components/ui/ImageUpload";

export default function AdminSettingsPage() {
  const { refreshCompany } = useCompanyBranding();
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
      await refreshCompany();
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
      <p className="text-stone text-sm mb-8">
        Firmendaten, Branding und Bankverbindung für Website, Dokumente und PWA
      </p>

      <form onSubmit={handleSave} className="bg-cream border border-wood/10 p-6 space-y-6 max-w-2xl">
        <section className="space-y-4">
          <h2 className="font-display text-lg text-wood-dark">Branding</h2>
          <ImageUpload
            label="Firmenlogo"
            hint="Wird auf Website, Rechnungen, E-Mails und in der Verwaltung angezeigt. Empfohlen: PNG mit transparentem Hintergrund."
            folder="branding"
            previewAspect="wide"
            value={form.logoUrl || ""}
            onChange={(logoUrl) => setForm({ ...form, logoUrl })}
          />
          <ImageUpload
            label="PWA-App-Icon"
            hint="Separates quadratisches Icon für installierte App (Startbildschirm). Empfohlen: 512×512 px, PNG."
            folder="branding"
            previewAspect="square"
            value={form.pwaIconUrl || ""}
            onChange={(pwaIconUrl) => setForm({ ...form, pwaIconUrl })}
          />
        </section>

        <section className="space-y-4">
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
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg text-wood-dark">Bankverbindung</h2>
          {field("bankName", "Bank")}
          {field("iban", "IBAN")}
          {field("bic", "BIC")}
        </section>

        {message && (
          <p className={`text-sm ${message.includes("Fehler") ? "text-red-600" : "text-green-700"}`}>
            {message}
          </p>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? "Speichern..." : "Speichern"}
        </Button>
      </form>
    </div>
  );
}
