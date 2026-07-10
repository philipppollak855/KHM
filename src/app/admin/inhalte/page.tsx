"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useSiteContent } from "@/context/SiteContentContext";
import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content";
import {
  AboutContentEditor,
  ContactContentEditor,
  HomeContentEditor,
  NavigationContentEditor,
  ShopContentEditor,
} from "@/components/admin/SiteContentEditors";
import { LegalContentEditor } from "@/components/admin/LegalContentEditor";

type TabId = "home" | "about" | "contact" | "shop" | "navigation" | "legal";

const TABS: { id: TabId; label: string; preview?: string }[] = [
  { id: "home", label: "Startseite", preview: "/" },
  { id: "about", label: "Über uns", preview: "/ueber-uns" },
  { id: "contact", label: "Kontakt", preview: "/kontakt" },
  { id: "shop", label: "Shop", preview: "/shop" },
  { id: "navigation", label: "Navigation & Login", preview: "/" },
  { id: "legal", label: "Rechtliches", preview: "/impressum" },
];

export default function AdminContentPage() {
  const { content, loading, saveContent } = useSiteContent();
  const [form, setForm] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [tab, setTab] = useState<TabId>("home");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading) setForm(content);
  }, [content, loading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await saveContent(form);
      setMessage("Inhalte gespeichert.");
    } catch {
      setMessage("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  };

  const activeTab = TABS.find((t) => t.id === tab);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-light text-wood-dark mb-2">
            Website-Inhalte
          </h1>
          <p className="text-stone text-sm max-w-xl">
            Texte und Bilder der Startseite und aller Unterseiten bearbeiten — ohne Code.
            Kursiv: *Wort* · Zeilenumbruch mit Enter.
          </p>
        </div>
        {activeTab?.preview && (
          <Link
            href={activeTab.preview}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm text-forest hover:underline shrink-0"
          >
            Vorschau öffnen
            <ExternalLink className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-wood/10 pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm rounded-full transition-colors ${
              tab === t.id
                ? "bg-forest text-cream"
                : "bg-wood/10 text-wood-dark hover:bg-wood/20"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="max-w-3xl">
        {tab === "home" && (
          <HomeContentEditor
            home={form.home}
            onChange={(home) => setForm({ ...form, home })}
          />
        )}
        {tab === "about" && (
          <AboutContentEditor
            about={form.about}
            onChange={(about) => setForm({ ...form, about })}
          />
        )}
        {tab === "contact" && (
          <ContactContentEditor
            contact={form.contact}
            onChange={(contact) => setForm({ ...form, contact })}
          />
        )}
        {tab === "shop" && (
          <ShopContentEditor
            shop={form.shop}
            onChange={(shop) => setForm({ ...form, shop })}
          />
        )}
        {tab === "navigation" && (
          <NavigationContentEditor
            navigation={form.navigation}
            auth={form.auth}
            onChangeNav={(navigation) => setForm({ ...form, navigation })}
            onChangeAuth={(auth) => setForm({ ...form, auth })}
          />
        )}
        {tab === "legal" && (
          <LegalContentEditor
            legal={form.legal}
            onChange={(legal) => setForm({ ...form, legal })}
          />
        )}

        <div className="sticky bottom-4 mt-8 flex flex-wrap items-center gap-4 bg-cream/95 backdrop-blur border border-wood/10 rounded-lg p-4">
          <Button type="submit" disabled={saving || loading}>
            {saving ? "Speichern…" : "Alle Inhalte speichern"}
          </Button>
          {message && (
            <p
              className={`text-sm ${
                message.includes("Fehler") ? "text-red-600" : "text-green-700"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
