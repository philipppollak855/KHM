"use client";

import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ImageUpload from "@/components/ui/ImageUpload";
import ImageListUpload from "@/components/admin/ImageListUpload";
import {
  newContentId,
  type AboutPageContent,
  type ContactPageContent,
  type ContentCard,
  type ContentExtraBlock,
  type ContentLink,
  type ContentStep,
  type HomePageContent,
  type NavigationContent,
  type ShopPageContent,
  type SiteContent,
} from "@/lib/site-content";

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

function LinkFields({
  value,
  onChange,
  labelPrefix = "Link",
}: {
  value: ContentLink;
  onChange: (link: ContentLink) => void;
  labelPrefix?: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Input
        label={`${labelPrefix} – Text`}
        value={value.label}
        onChange={(e) => onChange({ ...value, label: e.target.value })}
      />
      <Input
        label={`${labelPrefix} – URL`}
        value={value.href}
        onChange={(e) => onChange({ ...value, href: e.target.value })}
      />
    </div>
  );
}

function CardEditor({
  card,
  index,
  onChange,
  onRemove,
}: {
  card: ContentCard;
  index: number;
  onChange: (card: ContentCard) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-wood/10 rounded-lg p-4 space-y-3 bg-linen/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-wood-dark">Eintrag {index + 1}</p>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 p-1"
          aria-label="Eintrag entfernen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <Input
        label="Titel"
        value={card.title}
        onChange={(e) => onChange({ ...card, title: e.target.value })}
      />
      <Textarea
        label="Text"
        value={card.text}
        onChange={(e) => onChange({ ...card, text: e.target.value })}
      />
    </div>
  );
}

function StepEditor({
  step,
  index,
  onChange,
  onRemove,
}: {
  step: ContentStep;
  index: number;
  onChange: (step: ContentStep) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-wood/10 rounded-lg p-4 space-y-3 bg-linen/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-wood-dark">Schritt {index + 1}</p>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 p-1"
          aria-label="Schritt entfernen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <Input
        label="Kurzbezeichnung"
        value={step.step}
        onChange={(e) => onChange({ ...step, step: e.target.value })}
      />
      <Input
        label="Titel"
        value={step.title}
        onChange={(e) => onChange({ ...step, title: e.target.value })}
      />
      <Textarea
        label="Text"
        value={step.text}
        onChange={(e) => onChange({ ...step, text: e.target.value })}
      />
    </div>
  );
}

function ExtraBlockEditor({
  block,
  index,
  onChange,
  onRemove,
}: {
  block: ContentExtraBlock;
  index: number;
  onChange: (block: ContentExtraBlock) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-wood/10 rounded-lg p-4 space-y-3 bg-linen/50">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-wood-dark">Zusatzblock {index + 1}</p>
        <div className="flex items-center gap-2">
          <select
            value={block.type}
            onChange={(e) =>
              onChange({
                ...block,
                type: e.target.value as ContentExtraBlock["type"],
              })
            }
            className="text-sm border border-wood/20 rounded-lg px-2 py-1 bg-linen"
          >
            <option value="text">Nur Text</option>
            <option value="textImage">Text mit Bild</option>
            <option value="gallery">Bildergalerie</option>
          </select>
          <button
            type="button"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700 p-1"
            aria-label="Block entfernen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {(block.type === "text" || block.type === "textImage") && (
        <>
          <Input
            label="Überschrift (optional)"
            value={block.title || ""}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
          />
          <Textarea
            label="Text"
            value={block.text || ""}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
          />
        </>
      )}
      {block.type === "textImage" && (
        <>
          <ImageUpload
            label="Bild"
            folder="marketing"
            previewAspect="wide"
            value={block.imageUrl || ""}
            onChange={(imageUrl) => onChange({ ...block, imageUrl })}
          />
          <Input
            label="Bild-Beschreibung (Alt-Text)"
            value={block.imageAlt || ""}
            onChange={(e) => onChange({ ...block, imageAlt: e.target.value })}
          />
        </>
      )}
      {block.type === "gallery" && (
        <ImageListUpload
          label="Galeriebilder"
          hint="Beliebig viele Bilder hinzufügen."
          folder="marketing"
          images={block.images || []}
          onChange={(images) => onChange({ ...block, images })}
        />
      )}
    </div>
  );
}

export function HomeContentEditor({
  home,
  onChange,
}: {
  home: HomePageContent;
  onChange: (home: HomePageContent) => void;
}) {
  const update = <K extends keyof HomePageContent>(
    key: K,
    value: HomePageContent[K]
  ) => onChange({ ...home, [key]: value });

  return (
    <div className="space-y-6">
      <Section title="Hero-Bereich">
        <Input
          label="Label"
          value={home.hero.label}
          onChange={(e) => update("hero", { ...home.hero, label: e.target.value })}
        />
        <p className="text-xs text-stone -mb-2">
          Zeilenumbruch mit Enter. Kursiv: *Wort*
        </p>
        <Textarea
          label="Hauptüberschrift (*kursiv*)"
          value={home.hero.title}
          onChange={(e) => update("hero", { ...home.hero, title: e.target.value })}
        />
        <Textarea
          label="Untertitel"
          value={home.hero.subtitle}
          onChange={(e) => update("hero", { ...home.hero, subtitle: e.target.value })}
        />
        <LinkFields
          value={home.hero.primaryCta}
          onChange={(primaryCta) => update("hero", { ...home.hero, primaryCta })}
          labelPrefix="Haupt-Button"
        />
        <LinkFields
          value={home.hero.secondaryCta}
          onChange={(secondaryCta) => update("hero", { ...home.hero, secondaryCta })}
          labelPrefix="Zweit-Link"
        />
        <Input
          label="Scroll-Hinweis"
          value={home.hero.scrollHint}
          onChange={(e) => update("hero", { ...home.hero, scrollHint: e.target.value })}
        />
        <ImageUpload
          label="Hintergrundbild"
          folder="marketing"
          previewAspect="wide"
          value={home.hero.imageUrl}
          onChange={(imageUrl) => update("hero", { ...home.hero, imageUrl })}
        />
        <Input
          label="Bild-Beschreibung (Alt-Text)"
          value={home.hero.imageAlt}
          onChange={(e) => update("hero", { ...home.hero, imageAlt: e.target.value })}
        />
      </Section>

      <Section title="Philosophie">
        <Input
          label="Label"
          value={home.philosophy.label}
          onChange={(e) =>
            update("philosophy", { ...home.philosophy, label: e.target.value })
          }
        />
        <Textarea
          label="Überschrift (*kursiv*)"
          value={home.philosophy.title}
          onChange={(e) =>
            update("philosophy", { ...home.philosophy, title: e.target.value })
          }
        />
        <Textarea
          label="Absätze (ein Absatz pro Zeile)"
          value={home.philosophy.paragraphs.join("\n\n")}
          onChange={(e) =>
            update("philosophy", {
              ...home.philosophy,
              paragraphs: e.target.value.split("\n\n").filter(Boolean),
            })
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Statistik-Wert"
            value={home.philosophy.statValue}
            onChange={(e) =>
              update("philosophy", { ...home.philosophy, statValue: e.target.value })
            }
          />
          <Input
            label="Statistik-Text"
            value={home.philosophy.statLabel}
            onChange={(e) =>
              update("philosophy", { ...home.philosophy, statLabel: e.target.value })
            }
          />
        </div>
        <LinkFields
          value={home.philosophy.cta}
          onChange={(cta) => update("philosophy", { ...home.philosophy, cta })}
        />
        <ImageUpload
          label="Bild"
          folder="marketing"
          value={home.philosophy.imageUrl}
          onChange={(imageUrl) =>
            update("philosophy", { ...home.philosophy, imageUrl })
          }
        />
        <Input
          label="Bild-Beschreibung"
          value={home.philosophy.imageAlt}
          onChange={(e) =>
            update("philosophy", { ...home.philosophy, imageAlt: e.target.value })
          }
        />
      </Section>

      <Section title="Werte">
        <Input
          label="Label"
          value={home.values.label}
          onChange={(e) => update("values", { ...home.values, label: e.target.value })}
        />
        <Input
          label="Überschrift (*kursiv*)"
          value={home.values.title}
          onChange={(e) => update("values", { ...home.values, title: e.target.value })}
        />
        {home.values.items.map((item, i) => (
          <CardEditor
            key={item.id}
            card={item}
            index={i}
            onChange={(card) => {
              const items = [...home.values.items];
              items[i] = card;
              update("values", { ...home.values, items });
            }}
            onRemove={() => {
              if (home.values.items.length <= 1) return;
              update("values", {
                ...home.values,
                items: home.values.items.filter((_, idx) => idx !== i),
              });
            }}
          />
        ))}
        <button
          type="button"
          onClick={() =>
            update("values", {
              ...home.values,
              items: [
                ...home.values.items,
                { id: newContentId(), title: "Neuer Wert", text: "" },
              ],
            })
          }
          className="inline-flex items-center gap-2 text-sm text-forest hover:underline"
        >
          <Plus className="w-4 h-4" /> Wert hinzufügen
        </button>
      </Section>

      <Section title="Handwerksweg">
        <Input
          label="Label"
          value={home.craft.label}
          onChange={(e) => update("craft", { ...home.craft, label: e.target.value })}
        />
        <Textarea
          label="Überschrift (*kursiv*)"
          value={home.craft.title}
          onChange={(e) => update("craft", { ...home.craft, title: e.target.value })}
        />
        {home.craft.items.map((item, i) => (
          <StepEditor
            key={item.id}
            step={item}
            index={i}
            onChange={(step) => {
              const items = [...home.craft.items];
              items[i] = step;
              update("craft", { ...home.craft, items });
            }}
            onRemove={() => {
              if (home.craft.items.length <= 1) return;
              update("craft", {
                ...home.craft,
                items: home.craft.items.filter((_, idx) => idx !== i),
              });
            }}
          />
        ))}
        <button
          type="button"
          onClick={() =>
            update("craft", {
              ...home.craft,
              items: [
                ...home.craft.items,
                {
                  id: newContentId(),
                  step: "Schritt",
                  title: "Neuer Schritt",
                  text: "",
                },
              ],
            })
          }
          className="inline-flex items-center gap-2 text-sm text-forest hover:underline"
        >
          <Plus className="w-4 h-4" /> Schritt hinzufügen
        </button>
      </Section>

      <Section title="Ausgewählte Produkte">
        <p className="text-sm text-stone">
          Die Produkte selbst werden unter „Produkte“ verwaltet (Featured-Flag). Hier nur
          Überschriften und Link.
        </p>
        <Input
          label="Label"
          value={home.featured.label}
          onChange={(e) =>
            update("featured", { ...home.featured, label: e.target.value })
          }
        />
        <Input
          label="Überschrift"
          value={home.featured.title}
          onChange={(e) =>
            update("featured", { ...home.featured, title: e.target.value })
          }
        />
        <LinkFields
          value={home.featured.cta}
          onChange={(cta) => update("featured", { ...home.featured, cta })}
        />
      </Section>

      <Section title="Zitat">
        <Textarea
          label="Zitat"
          value={home.quote.text}
          onChange={(e) => update("quote", { ...home.quote, text: e.target.value })}
        />
        <Input
          label="Quelle / Autor"
          value={home.quote.attribution}
          onChange={(e) =>
            update("quote", { ...home.quote, attribution: e.target.value })
          }
        />
        <ImageUpload
          label="Hintergrundbild"
          folder="marketing"
          previewAspect="wide"
          value={home.quote.imageUrl}
          onChange={(imageUrl) => update("quote", { ...home.quote, imageUrl })}
        />
        <Input
          label="Bild-Beschreibung"
          value={home.quote.imageAlt}
          onChange={(e) =>
            update("quote", { ...home.quote, imageAlt: e.target.value })
          }
        />
      </Section>

      <Section title="Abschluss-CTA">
        <Input
          label="Label"
          value={home.cta.label}
          onChange={(e) => update("cta", { ...home.cta, label: e.target.value })}
        />
        <Textarea
          label="Überschrift (*kursiv*)"
          value={home.cta.title}
          onChange={(e) => update("cta", { ...home.cta, title: e.target.value })}
        />
        <Textarea
          label="Text"
          value={home.cta.body}
          onChange={(e) => update("cta", { ...home.cta, body: e.target.value })}
        />
        <LinkFields
          value={home.cta.button}
          onChange={(button) => update("cta", { ...home.cta, button })}
          labelPrefix="Button"
        />
      </Section>
    </div>
  );
}

export function AboutContentEditor({
  about,
  onChange,
}: {
  about: AboutPageContent;
  onChange: (about: AboutPageContent) => void;
}) {
  const update = <K extends keyof AboutPageContent>(
    key: K,
    value: AboutPageContent[K]
  ) => onChange({ ...about, [key]: value });

  return (
    <div className="space-y-6">
      <Section title="Seitenkopf">
        <Input
          label="Label"
          value={about.header.label}
          onChange={(e) =>
            update("header", { ...about.header, label: e.target.value })
          }
        />
        <Input
          label="Titel"
          value={about.header.title}
          onChange={(e) =>
            update("header", { ...about.header, title: e.target.value })
          }
        />
        <Textarea
          label="Beschreibung"
          value={about.header.description}
          onChange={(e) =>
            update("header", { ...about.header, description: e.target.value })
          }
        />
      </Section>

      <Section title="Karten">
        {about.cards.map((card, i) => (
          <CardEditor
            key={card.id}
            card={card}
            index={i}
            onChange={(c) => {
              const cards = [...about.cards];
              cards[i] = c;
              update("cards", cards);
            }}
            onRemove={() => {
              if (about.cards.length <= 1) return;
              update(
                "cards",
                about.cards.filter((_, idx) => idx !== i)
              );
            }}
          />
        ))}
        <button
          type="button"
          onClick={() =>
            update("cards", [
              ...about.cards,
              { id: newContentId(), title: "Neue Karte", text: "" },
            ])
          }
          className="inline-flex items-center gap-2 text-sm text-forest hover:underline"
        >
          <Plus className="w-4 h-4" /> Karte hinzufügen
        </button>
      </Section>

      <Section title="Bildergalerie">
        <ImageListUpload
          label="Galeriebilder"
          hint="Beliebig viele Bilder für die Über-uns-Seite."
          folder="marketing"
          images={about.galleryImages}
          onChange={(galleryImages) => update("galleryImages", galleryImages)}
        />
      </Section>

      <Section title="Zusätzliche Inhaltsblöcke">
        <p className="text-sm text-stone">
          Erweiterbare Bereiche mit Text, Bild oder Galerie — beliebig hinzufügbar.
        </p>
        {about.extraBlocks.map((block, i) => (
          <ExtraBlockEditor
            key={block.id}
            block={block}
            index={i}
            onChange={(b) => {
              const extraBlocks = [...about.extraBlocks];
              extraBlocks[i] = b;
              update("extraBlocks", extraBlocks);
            }}
            onRemove={() =>
              update(
                "extraBlocks",
                about.extraBlocks.filter((_, idx) => idx !== i)
              )
            }
          />
        ))}
        <button
          type="button"
          onClick={() =>
            update("extraBlocks", [
              ...about.extraBlocks,
              { id: newContentId(), type: "text", title: "", text: "" },
            ])
          }
          className="inline-flex items-center gap-2 text-sm text-forest hover:underline"
        >
          <Plus className="w-4 h-4" /> Block hinzufügen
        </button>
      </Section>

      <Section title="Werkstatt-Einladung">
        <Input
          label="Titel"
          value={about.workshopCta.title}
          onChange={(e) =>
            update("workshopCta", { ...about.workshopCta, title: e.target.value })
          }
        />
        <Textarea
          label="Text"
          value={about.workshopCta.text}
          onChange={(e) =>
            update("workshopCta", { ...about.workshopCta, text: e.target.value })
          }
        />
        <LinkFields
          value={about.workshopCta.button}
          onChange={(button) =>
            update("workshopCta", { ...about.workshopCta, button })
          }
          labelPrefix="Button"
        />
      </Section>
    </div>
  );
}

export function ContactContentEditor({
  contact,
  onChange,
}: {
  contact: ContactPageContent;
  onChange: (contact: ContactPageContent) => void;
}) {
  const update = <K extends keyof ContactPageContent>(
    key: K,
    value: ContactPageContent[K]
  ) => onChange({ ...contact, [key]: value });

  return (
    <div className="space-y-6">
      <Section title="Seitenkopf">
        <Input
          label="Label"
          value={contact.header.label}
          onChange={(e) =>
            update("header", { ...contact.header, label: e.target.value })
          }
        />
        <Input
          label="Titel"
          value={contact.header.title}
          onChange={(e) =>
            update("header", { ...contact.header, title: e.target.value })
          }
        />
        <Textarea
          label="Beschreibung"
          value={contact.header.description}
          onChange={(e) =>
            update("header", { ...contact.header, description: e.target.value })
          }
        />
      </Section>
      <p className="text-sm text-stone">
        Adresse, E-Mail und Telefon werden unter „Firma & Shop“ gepflegt und hier automatisch
        angezeigt.
      </p>
      <Section title="Kontaktformular">
        <Input
          label="Feld: Name"
          value={contact.form.nameLabel}
          onChange={(e) =>
            update("form", { ...contact.form, nameLabel: e.target.value })
          }
        />
        <Input
          label="Feld: E-Mail"
          value={contact.form.emailLabel}
          onChange={(e) =>
            update("form", { ...contact.form, emailLabel: e.target.value })
          }
        />
        <Input
          label="Feld: Betreff"
          value={contact.form.subjectLabel}
          onChange={(e) =>
            update("form", { ...contact.form, subjectLabel: e.target.value })
          }
        />
        <Input
          label="Feld: Nachricht"
          value={contact.form.messageLabel}
          onChange={(e) =>
            update("form", { ...contact.form, messageLabel: e.target.value })
          }
        />
        <Input
          label="Button-Text"
          value={contact.form.submitLabel}
          onChange={(e) =>
            update("form", { ...contact.form, submitLabel: e.target.value })
          }
        />
        <Input
          label="Lade-Text"
          value={contact.form.loadingLabel}
          onChange={(e) =>
            update("form", { ...contact.form, loadingLabel: e.target.value })
          }
        />
        <Input
          label="Erfolg – Titel"
          value={contact.form.successTitle}
          onChange={(e) =>
            update("form", { ...contact.form, successTitle: e.target.value })
          }
        />
        <Textarea
          label="Erfolg – Text"
          value={contact.form.successMessage}
          onChange={(e) =>
            update("form", { ...contact.form, successMessage: e.target.value })
          }
        />
        <Textarea
          label="Fehler – Text"
          value={contact.form.errorMessage}
          onChange={(e) =>
            update("form", { ...contact.form, errorMessage: e.target.value })
          }
        />
      </Section>
    </div>
  );
}

export function ShopContentEditor({
  shop,
  onChange,
}: {
  shop: ShopPageContent;
  onChange: (shop: ShopPageContent) => void;
}) {
  const update = <K extends keyof ShopPageContent>(
    key: K,
    value: ShopPageContent[K]
  ) => onChange({ ...shop, [key]: value });

  return (
    <div className="space-y-6">
      <Section title="Seitenkopf">
        <Input
          label="Label"
          value={shop.header.label}
          onChange={(e) =>
            update("header", { ...shop.header, label: e.target.value })
          }
        />
        <Input
          label="Titel"
          value={shop.header.title}
          onChange={(e) =>
            update("header", { ...shop.header, title: e.target.value })
          }
        />
        <Textarea
          label="Beschreibung"
          value={shop.header.description}
          onChange={(e) =>
            update("header", { ...shop.header, description: e.target.value })
          }
        />
      </Section>
      <Section title="Leerer Shop">
        <Input
          label="Emoji"
          value={shop.emptyState.emoji}
          onChange={(e) =>
            update("emptyState", { ...shop.emptyState, emoji: e.target.value })
          }
        />
        <Input
          label="Titel"
          value={shop.emptyState.title}
          onChange={(e) =>
            update("emptyState", { ...shop.emptyState, title: e.target.value })
          }
        />
        <Textarea
          label="Text"
          value={shop.emptyState.text}
          onChange={(e) =>
            update("emptyState", { ...shop.emptyState, text: e.target.value })
          }
        />
      </Section>
      <Input
        label="Filter: Alle Kategorien"
        value={shop.allCategoriesLabel}
        onChange={(e) => update("allCategoriesLabel", e.target.value)}
      />
    </div>
  );
}

export function NavigationContentEditor({
  navigation,
  auth,
  onChangeNav,
  onChangeAuth,
}: {
  navigation: NavigationContent;
  auth: SiteContent["auth"];
  onChangeNav: (navigation: NavigationContent) => void;
  onChangeAuth: (auth: SiteContent["auth"]) => void;
}) {
  const updateLink = (index: number, link: ContentLink) => {
    const links = [...navigation.links];
    links[index] = link;
    onChangeNav({ ...navigation, links });
  };

  return (
    <div className="space-y-6">
      <Section title="Hauptnavigation">
        {navigation.links.map((link, i) => (
          <div key={i} className="border border-wood/10 rounded-lg p-4 space-y-3 bg-linen/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-wood-dark">Menüpunkt {i + 1}</p>
              {navigation.links.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    onChangeNav({
                      ...navigation,
                      links: navigation.links.filter((_, idx) => idx !== i),
                    })
                  }
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <LinkFields value={link} onChange={(l) => updateLink(i, l)} />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onChangeNav({
              ...navigation,
              links: [...navigation.links, { label: "Neu", href: "/" }],
            })
          }
          className="inline-flex items-center gap-2 text-sm text-forest hover:underline"
        >
          <Plus className="w-4 h-4" /> Menüpunkt hinzufügen
        </button>
      </Section>

      <Section title="Footer">
        <Input
          label="Navigation – Überschrift"
          value={navigation.footer.navigationTitle}
          onChange={(e) =>
            onChangeNav({
              ...navigation,
              footer: { ...navigation.footer, navigationTitle: e.target.value },
            })
          }
        />
        <Input
          label="Kontakt – Überschrift"
          value={navigation.footer.contactTitle}
          onChange={(e) =>
            onChangeNav({
              ...navigation,
              footer: { ...navigation.footer, contactTitle: e.target.value },
            })
          }
        />
        <Input
          label="Kundenbereich – Linktext"
          value={navigation.footer.customerAreaLabel}
          onChange={(e) =>
            onChangeNav({
              ...navigation,
              footer: { ...navigation.footer, customerAreaLabel: e.target.value },
            })
          }
        />
        <Input
          label="Anmelden-Button"
          value={navigation.loginLabel}
          onChange={(e) => onChangeNav({ ...navigation, loginLabel: e.target.value })}
        />
        <Input
          label="Abmelden-Button"
          value={navigation.logoutLabel}
          onChange={(e) => onChangeNav({ ...navigation, logoutLabel: e.target.value })}
        />
      </Section>

      <Section title="Login-Seite">
        <Input
          label="Titel"
          value={auth.login.title}
          onChange={(e) =>
            onChangeAuth({ ...auth, login: { ...auth.login, title: e.target.value } })
          }
        />
        <Textarea
          label="Untertitel"
          value={auth.login.subtitle}
          onChange={(e) =>
            onChangeAuth({ ...auth, login: { ...auth.login, subtitle: e.target.value } })
          }
        />
        <Input
          label="Registrieren-Hinweis"
          value={auth.login.registerPrompt}
          onChange={(e) =>
            onChangeAuth({
              ...auth,
              login: { ...auth.login, registerPrompt: e.target.value },
            })
          }
        />
        <Input
          label="Registrieren-Link"
          value={auth.login.registerLink}
          onChange={(e) =>
            onChangeAuth({
              ...auth,
              login: { ...auth.login, registerLink: e.target.value },
            })
          }
        />
      </Section>

      <Section title="Registrieren-Seite">
        <Input
          label="Titel"
          value={auth.register.title}
          onChange={(e) =>
            onChangeAuth({ ...auth, register: { ...auth.register, title: e.target.value } })
          }
        />
        <Textarea
          label="Untertitel"
          value={auth.register.subtitle}
          onChange={(e) =>
            onChangeAuth({
              ...auth,
              register: { ...auth.register, subtitle: e.target.value },
            })
          }
        />
        <Input
          label="Login-Hinweis"
          value={auth.register.loginPrompt}
          onChange={(e) =>
            onChangeAuth({
              ...auth,
              register: { ...auth.register, loginPrompt: e.target.value },
            })
          }
        />
        <Input
          label="Login-Link"
          value={auth.register.loginLink}
          onChange={(e) =>
            onChangeAuth({
              ...auth,
              register: { ...auth.register, loginLink: e.target.value },
            })
          }
        />
      </Section>
    </div>
  );
}
