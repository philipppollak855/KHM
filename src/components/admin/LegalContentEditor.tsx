"use client";

import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import type { ContentLink, SiteContent } from "@/lib/site-content";
import type { LegalContent, LegalDocumentContent } from "@/lib/legal-content";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-wood/10 rounded-lg overflow-hidden">
      <div className="bg-linen-dark/40 px-4 py-3 border-b border-wood/10">
        <h3 className="font-display text-lg text-wood-dark">{title}</h3>
      </div>
      <div className="p-4 space-y-4 bg-cream">{children}</div>
    </section>
  );
}

function LegalDocEditor({
  doc,
  onChange,
}: {
  doc: LegalDocumentContent;
  onChange: (doc: LegalDocumentContent) => void;
}) {
  return (
    <>
      <Input
        label="Seitentitel"
        value={doc.title}
        onChange={(e) => onChange({ ...doc, title: e.target.value })}
      />
      <Input
        label="Stand (YYYY-MM-DD)"
        value={doc.lastUpdated}
        onChange={(e) => onChange({ ...doc, lastUpdated: e.target.value })}
      />
      <p className="text-xs text-stone">
        Absätze mit Leerzeile. Überschriften: ## oder ###. Fett: **Text**. Platzhalter:{" "}
        {"{firma}"}, {"{strasse}"}, {"{plz}"}, {"{ort}"}, {"{email}"}, {"{telefon}"},{" "}
        {"{website}"}, {"{uid}"}, {"{firmenbuch}"}
      </p>
      <Textarea
        label="Inhalt"
        value={doc.body}
        onChange={(e) => onChange({ ...doc, body: e.target.value })}
        className="min-h-[280px] font-mono text-sm"
      />
    </>
  );
}

function LinkFields({
  value,
  onChange,
}: {
  value: ContentLink;
  onChange: (link: ContentLink) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Input
        label="Link-Text"
        value={value.label}
        onChange={(e) => onChange({ ...value, label: e.target.value })}
      />
      <Input
        label="URL"
        value={value.href}
        onChange={(e) => onChange({ ...value, href: e.target.value })}
      />
    </div>
  );
}

export function LegalContentEditor({
  legal,
  onChange,
}: {
  legal: LegalContent;
  onChange: (legal: LegalContent) => void;
}) {
  const update = <K extends keyof LegalContent>(key: K, value: LegalContent[K]) =>
    onChange({ ...legal, [key]: value });

  return (
    <div className="space-y-6">
      <p className="text-sm text-stone">
        Österreichische Mustervorlagen mit Platzhaltern für Firmendaten aus „Firma & Shop“.
        Bitte von einem Rechtsanwalt prüfen lassen, bevor Sie live gehen.
      </p>

      <Section title="Impressum">
        <LegalDocEditor
          doc={legal.impressum}
          onChange={(impressum) => update("impressum", impressum)}
        />
      </Section>

      <Section title="Datenschutzerklärung">
        <LegalDocEditor
          doc={legal.privacy}
          onChange={(privacy) => update("privacy", privacy)}
        />
      </Section>

      <Section title="AGB Online-Shop">
        <LegalDocEditor
          doc={legal.agbOnline}
          onChange={(agbOnline) => update("agbOnline", agbOnline)}
        />
      </Section>

      <Section title="AGB Kassa / Ladengeschäft">
        <LegalDocEditor
          doc={legal.agbPos}
          onChange={(agbPos) => update("agbPos", agbPos)}
        />
      </Section>

      <Section title="Widerrufsbelehrung">
        <LegalDocEditor
          doc={legal.withdrawal}
          onChange={(withdrawal) => update("withdrawal", withdrawal)}
        />
      </Section>

      <Section title="Cookie-Banner">
        <Input
          label="Richtlinien-Version (Zahl – erhöhen bei Änderungen)"
          type="number"
          min={1}
          value={String(legal.cookieBanner.policyVersion)}
          onChange={(e) =>
            update("cookieBanner", {
              ...legal.cookieBanner,
              policyVersion: parseInt(e.target.value, 10) || 1,
            })
          }
        />
        <Input
          label="Titel"
          value={legal.cookieBanner.title}
          onChange={(e) =>
            update("cookieBanner", { ...legal.cookieBanner, title: e.target.value })
          }
        />
        <Textarea
          label="Beschreibung"
          value={legal.cookieBanner.description}
          onChange={(e) =>
            update("cookieBanner", { ...legal.cookieBanner, description: e.target.value })
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Button: Alle akzeptieren"
            value={legal.cookieBanner.acceptAllLabel}
            onChange={(e) =>
              update("cookieBanner", {
                ...legal.cookieBanner,
                acceptAllLabel: e.target.value,
              })
            }
          />
          <Input
            label="Button: Nur notwendige"
            value={legal.cookieBanner.rejectOptionalLabel}
            onChange={(e) =>
              update("cookieBanner", {
                ...legal.cookieBanner,
                rejectOptionalLabel: e.target.value,
              })
            }
          />
        </div>
        <Input
          label="Kategorie: Notwendig – Titel"
          value={legal.cookieBanner.necessary.title}
          onChange={(e) =>
            update("cookieBanner", {
              ...legal.cookieBanner,
              necessary: { ...legal.cookieBanner.necessary, title: e.target.value },
            })
          }
        />
        <Textarea
          label="Kategorie: Notwendig – Beschreibung"
          value={legal.cookieBanner.necessary.description}
          onChange={(e) =>
            update("cookieBanner", {
              ...legal.cookieBanner,
              necessary: { ...legal.cookieBanner.necessary, description: e.target.value },
            })
          }
        />
        <Input
          label="Kategorie: Komfort – Titel"
          value={legal.cookieBanner.functional.title}
          onChange={(e) =>
            update("cookieBanner", {
              ...legal.cookieBanner,
              functional: { ...legal.cookieBanner.functional, title: e.target.value },
            })
          }
        />
        <Textarea
          label="Kategorie: Komfort – Beschreibung"
          value={legal.cookieBanner.functional.description}
          onChange={(e) =>
            update("cookieBanner", {
              ...legal.cookieBanner,
              functional: { ...legal.cookieBanner.functional, description: e.target.value },
            })
          }
        />
      </Section>

      <Section title="Footer – Rechtliche Links">
        <Input
          label="Abschnittstitel"
          value={legal.footer.sectionTitle}
          onChange={(e) =>
            update("footer", { ...legal.footer, sectionTitle: e.target.value })
          }
        />
        {legal.footer.links.map((link, i) => (
          <div key={i} className="border border-wood/10 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-wood-dark">Link {i + 1}</span>
              <button
                type="button"
                onClick={() =>
                  update("footer", {
                    ...legal.footer,
                    links: legal.footer.links.filter((_, idx) => idx !== i),
                  })
                }
                className="text-red-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <LinkFields
              value={link}
              onChange={(l) => {
                const links = [...legal.footer.links];
                links[i] = l;
                update("footer", { ...legal.footer, links });
              }}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            update("footer", {
              ...legal.footer,
              links: [...legal.footer.links, { label: "Neu", href: "/" }],
            })
          }
          className="inline-flex items-center gap-2 text-sm text-forest hover:underline"
        >
          <Plus className="w-4 h-4" /> Link hinzufügen
        </button>
      </Section>

      <Section title="Checkout & Kassa">
        <Textarea
          label="Checkout: AGB-Checkbox"
          value={legal.checkout.agbLabel}
          onChange={(e) =>
            update("checkout", { ...legal.checkout, agbLabel: e.target.value })
          }
        />
        <Textarea
          label="Checkout: Widerruf-Checkbox"
          value={legal.checkout.withdrawalLabel}
          onChange={(e) =>
            update("checkout", { ...legal.checkout, withdrawalLabel: e.target.value })
          }
        />
        <Textarea
          label="Checkout: Datenschutz-Hinweis"
          value={legal.checkout.privacyNote}
          onChange={(e) =>
            update("checkout", { ...legal.checkout, privacyNote: e.target.value })
          }
        />
        <Textarea
          label="Kassa: Hinweistext"
          value={legal.posNotice}
          onChange={(e) => update("posNotice", e.target.value)}
        />
      </Section>
    </div>
  );
}
