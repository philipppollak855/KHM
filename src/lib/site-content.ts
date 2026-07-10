import type { LegalContent } from "./legal-content";
import { DEFAULT_LEGAL_CONTENT } from "./legal-content";
import { LANDING_IMAGES } from "@/lib/marketing-images";

export interface ContentLink {
  label: string;
  href: string;
}

export interface ContentCard {
  id: string;
  title: string;
  text: string;
}

export interface ContentStep {
  id: string;
  step: string;
  title: string;
  text: string;
}

/** Erweiterbarer Inhaltsblock (Text, Bild oder Galerie) */
export interface ContentExtraBlock {
  id: string;
  type: "text" | "textImage" | "gallery";
  title?: string;
  text?: string;
  imageUrl?: string;
  imageAlt?: string;
  images?: string[];
}

export interface HomePageContent {
  hero: {
    label: string;
    title: string;
    subtitle: string;
    primaryCta: ContentLink;
    secondaryCta: ContentLink;
    scrollHint: string;
    imageUrl: string;
    imageAlt: string;
  };
  philosophy: {
    label: string;
    title: string;
    paragraphs: string[];
    statValue: string;
    statLabel: string;
    cta: ContentLink;
    imageUrl: string;
    imageAlt: string;
  };
  values: {
    label: string;
    title: string;
    items: ContentCard[];
  };
  craft: {
    label: string;
    title: string;
    items: ContentStep[];
  };
  featured: {
    label: string;
    title: string;
    cta: ContentLink;
  };
  quote: {
    text: string;
    attribution: string;
    imageUrl: string;
    imageAlt: string;
  };
  cta: {
    label: string;
    title: string;
    body: string;
    button: ContentLink;
  };
}

export interface AboutPageContent {
  header: {
    label: string;
    title: string;
    description: string;
  };
  cards: ContentCard[];
  galleryImages: string[];
  extraBlocks: ContentExtraBlock[];
  workshopCta: {
    title: string;
    text: string;
    button: ContentLink;
  };
}

export interface ContactPageContent {
  header: {
    label: string;
    title: string;
    description: string;
  };
  form: {
    nameLabel: string;
    emailLabel: string;
    subjectLabel: string;
    messageLabel: string;
    submitLabel: string;
    loadingLabel: string;
    successTitle: string;
    successMessage: string;
    errorMessage: string;
  };
}

export interface ShopPageContent {
  header: {
    label: string;
    title: string;
    description: string;
  };
  emptyState: {
    emoji: string;
    title: string;
    text: string;
  };
  allCategoriesLabel: string;
}

export interface NavigationContent {
  links: ContentLink[];
  footer: {
    navigationTitle: string;
    contactTitle: string;
    customerAreaLabel: string;
  };
  loginLabel: string;
  logoutLabel: string;
  cartLabel: string;
}

export interface AuthPageContent {
  login: {
    title: string;
    subtitle: string;
    emailLabel: string;
    passwordLabel: string;
    submitLabel: string;
    registerPrompt: string;
    registerLink: string;
  };
  register: {
    title: string;
    subtitle: string;
    submitLabel: string;
    loginPrompt: string;
    loginLink: string;
  };
}

export interface SiteContent {
  home: HomePageContent;
  about: AboutPageContent;
  contact: ContactPageContent;
  shop: ShopPageContent;
  navigation: NavigationContent;
  auth: AuthPageContent;
  legal: LegalContent;
}

function card(id: string, title: string, text: string): ContentCard {
  return { id, title, text };
}

function step(id: string, stepLabel: string, title: string, text: string): ContentStep {
  return { id, step: stepLabel, title, text };
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  home: {
    hero: {
      label: "Schneebergland · Niederösterreich",
      title: "Handwerk,\n*verwurzelt* in der Natur",
      subtitle:
        "In unserer Manufaktur entstehen Unikate aus Holz, Wolle und regionalen Materialien — jedes Stück ein Zeugnis echter Handwerkskunst.",
      primaryCta: { label: "Kollektion entdecken", href: "/shop" },
      secondaryCta: { label: "Unsere Geschichte", href: "/ueber-uns" },
      scrollHint: "Entdecken",
      imageUrl: LANDING_IMAGES.heroForest,
      imageAlt: "Wald im Schneebergland",
    },
    philosophy: {
      label: "Unsere Philosophie",
      title: "Langsam gemacht.\n*Mit Bedacht.*",
      paragraphs: [
        "Kevin's Handmade Manufactur steht für eine Rückbesinnung auf echtes Handwerk. Inmitten des Schneeberglandes fertigen wir Produkte, die Zeit, Geduld und Respekt vor dem Material verdienen.",
        "Keine Massenproduktion, keine Eile — nur die ruhige Arbeit der Hände, die Holz, Wolle und Naturmaterialien in etwas Bleibendes verwandeln.",
      ],
      statValue: "2018",
      statLabel: "Gegründet im Schneebergland",
      cta: { label: "Mehr erfahren", href: "/ueber-uns" },
      imageUrl: LANDING_IMAGES.philosophyWorkshop,
      imageAlt: "Handwerkskunst in der Werkstatt",
    },
    values: {
      label: "Was uns leitet",
      title: "Werte, die man *spürt*",
      items: [
        card(
          "v1",
          "Reine Materialien",
          "Holz aus heimischen Wäldern, Wolle von regionalen Höfen — nur was die Natur uns gibt und was wir mit gutem Gewissen verarbeiten."
        ),
        card(
          "v2",
          "Handwerkliche Präzision",
          "Jede Schnitzung, jeder Stich wird von Hand gesetzt. Unregelmäßigkeiten sind kein Fehler, sondern das Zeichen echter Arbeit."
        ),
        card(
          "v3",
          "Heimat & Herkunft",
          "Das Schneebergland prägt unsere Formen, Farben und unseren Rhythmus. Was wir schaffen, trägt die Seele dieser Landschaft."
        ),
      ],
    },
    craft: {
      label: "Der Weg zum Unikat",
      title: "Vom Rohstoff zum\n*fertigen Stück*",
      items: [
        step(
          "c1",
          "Auswahl",
          "Materialien mit Geschichte",
          "Jedes Holz, jede Faser wird bewusst ausgewählt — oft direkt aus der Umgebung des Schneeberglandes."
        ),
        step(
          "c2",
          "Entstehung",
          "Handwerk in der Werkstatt",
          "In ruhiger Atmosphäre formen wir jedes Stück mit traditionellen Techniken und modernem Auge für Form."
        ),
        step(
          "c3",
          "Vollendung",
          "Pflege & Übergabe",
          "Natürliche Öle, sorgfältige Verpackung — bis das Unikat bereit ist, ein neues Zuhause zu finden."
        ),
      ],
    },
    featured: {
      label: "Kuratiert für Sie",
      title: "Ausgewählte Stücke",
      cta: { label: "Gesamte Kollektion", href: "/shop" },
    },
    quote: {
      text: '„Was von Hand gemacht wird, trägt die Wärme der Hände, die es formten — lange nachdem es unser Haus verlassen hat."',
      attribution: "Kevin · Gründer & Handwerker",
      imageUrl: LANDING_IMAGES.quoteNature,
      imageAlt: "Naturdetail",
    },
    cta: {
      label: "Ein Stück Heimat",
      title: "Bringen Sie das Schneebergland\n*nach Hause*",
      body:
        "Entdecken Sie unsere handgefertigte Kollektion — jedes Stück ein Unikat, gefertigt mit Sorgfalt und Liebe zum Detail.",
      button: { label: "Zur Kollektion", href: "/shop" },
    },
  },
  about: {
    header: {
      label: "Unsere Geschichte",
      title: "Aus dem Herzen des Schneeberglandes",
      description:
        "Kevin's Handmade Manufactur entstand aus der Liebe zur Handwerkskunst und der Verbundenheit mit unserer Heimat.",
    },
    cards: [
      card(
        "a1",
        "Verwurzelt",
        "Inspiriert von den Bergen, Wäldern und Traditionen unserer Region."
      ),
      card(
        "a2",
        "Handwerklich",
        "Jedes Stück von Hand gefertigt — kein Fließband, sondern echtes Handwerk."
      ),
      card(
        "a3",
        "Nachhaltig",
        "Regionale Materialien, vor allem Holz aus heimischen Wäldern."
      ),
    ],
    galleryImages: [],
    extraBlocks: [],
    workshopCta: {
      title: "Besuchen Sie unsere Werkstatt",
      text: "Erleben Sie, wie unsere Produkte entstehen. Vereinbaren Sie einen Termin über unsere Kontaktseite.",
      button: { label: "Kontakt aufnehmen", href: "/kontakt" },
    },
  },
  contact: {
    header: {
      label: "Kontakt",
      title: "Schreiben Sie uns",
      description: "Wir freuen uns auf Ihre Nachricht aus dem Schneebergland.",
    },
    form: {
      nameLabel: "Name",
      emailLabel: "E-Mail",
      subjectLabel: "Betreff",
      messageLabel: "Nachricht",
      submitLabel: "Nachricht senden",
      loadingLabel: "Wird gesendet...",
      successTitle: "Nachricht gesendet!",
      successMessage: "Vielen Dank. Wir melden uns bald bei Ihnen.",
      errorMessage: "Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
    },
  },
  shop: {
    header: {
      label: "Kollektion",
      title: "Unser Shop",
      description: "Handgemachte Unikate aus dem Schneebergland — alle Preise inkl. USt.",
    },
    emptyState: {
      emoji: "🌲",
      title: "Noch keine Produkte",
      text: "Bald finden Sie hier unsere handgemachten Schätze.",
    },
    allCategoriesLabel: "Alle",
  },
  navigation: {
    links: [
      { label: "Start", href: "/" },
      { label: "Kollektion", href: "/shop" },
      { label: "Über uns", href: "/ueber-uns" },
      { label: "Kontakt", href: "/kontakt" },
    ],
    footer: {
      navigationTitle: "Navigation",
      contactTitle: "Kontakt",
      customerAreaLabel: "Kundenbereich",
    },
    loginLabel: "Anmelden",
    logoutLabel: "Abmelden",
    cartLabel: "Warenkorb",
  },
  auth: {
    login: {
      title: "Willkommen zurück",
      subtitle: "Melden Sie sich in Ihrem Konto an.",
      emailLabel: "E-Mail",
      passwordLabel: "Passwort",
      submitLabel: "Anmelden",
      registerPrompt: "Noch kein Konto?",
      registerLink: "Jetzt registrieren",
    },
    register: {
      title: "Konto erstellen",
      subtitle: "Werden Sie Teil der KHM-Familie.",
      submitLabel: "Konto erstellen",
      loginPrompt: "Bereits registriert?",
      loginLink: "Zum Login",
    },
  },
  legal: DEFAULT_LEGAL_CONTENT,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeSiteContent(partial?: Partial<SiteContent> | null): SiteContent {
  if (!partial) return DEFAULT_SITE_CONTENT;

  const merge = <T>(defaults: T, override: unknown): T => {
    if (override === undefined || override === null) return defaults;
    if (Array.isArray(defaults)) {
      return (Array.isArray(override) && override.length > 0 ? override : defaults) as T;
    }
    if (isPlainObject(defaults) && isPlainObject(override)) {
      const result = { ...defaults } as Record<string, unknown>;
      for (const key of Object.keys(defaults)) {
        result[key] = merge(
          (defaults as Record<string, unknown>)[key],
          override[key]
        );
      }
      for (const key of Object.keys(override)) {
        if (!(key in result)) {
          result[key] = override[key];
        }
      }
      return result as T;
    }
    return override as T;
  };

  return merge(DEFAULT_SITE_CONTENT, partial);
}

export function newContentId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
