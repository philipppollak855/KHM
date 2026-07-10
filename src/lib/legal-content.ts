import type { ContentLink } from "./site-content";
import type { CompanySettings } from "./types";

export interface LegalDocumentContent {
  title: string;
  /** Stand der Informationen (YYYY-MM-DD) */
  lastUpdated: string;
  body: string;
}

export interface CookieCategoryContent {
  title: string;
  description: string;
}

export interface CookieBannerContent {
  policyVersion: number;
  title: string;
  description: string;
  acceptAllLabel: string;
  rejectOptionalLabel: string;
  customizeLabel: string;
  saveLabel: string;
  privacyLinkLabel: string;
  impressumLinkLabel: string;
  necessary: CookieCategoryContent;
  functional: CookieCategoryContent;
  analytics: CookieCategoryContent;
}

export interface CheckoutLegalContent {
  agbLabel: string;
  withdrawalLabel: string;
  privacyNote: string;
  errorMessage: string;
}

export interface LegalContent {
  impressum: LegalDocumentContent;
  privacy: LegalDocumentContent;
  agbOnline: LegalDocumentContent;
  agbPos: LegalDocumentContent;
  withdrawal: LegalDocumentContent;
  cookieBanner: CookieBannerContent;
  footer: {
    sectionTitle: string;
    links: ContentLink[];
  };
  checkout: CheckoutLegalContent;
  posNotice: string;
}

const IMPRESSUM_BODY = `## Angaben gemäß § 5 ECG und § 25 Mediengesetz

**{firma}**
{strasse}
{plz} {ort}
{land}

**Kontakt**
Telefon: {telefon}
E-Mail: {email}
Website: {website}

**Unternehmensgegenstand**
Handgefertigte Produkte aus Holz, Wolle und regionalen Naturmaterialien; Verkauf im Online-Shop sowie im Ladengeschäft bzw. an der Kassa.

**UID-Nummer:** {uid}
**Firmenbuch:** {firmenbuch}
**Firmenbuchgericht:** Landesgericht Wiener Neustadt

**Gewerbebehörde:** Bezirkshauptmannschaft Neunkirchen
**Anwendbare Rechtsvorschriften:** Gewerbeordnung (GewO), E-Commerce-Gesetz (ECG), Konsumentenschutzgesetz (KSchG)

**Aufsichtsbehörde / Kammer:** Wirtschaftskammer Niederösterreich

## EU-Streitschlichtung

Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/

Unsere E-Mail-Adresse finden Sie oben im Impressum.

## Verbraucherstreitbeilegung

Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`;

const PRIVACY_BODY = `## 1. Verantwortlicher

Verantwortlich für die Datenverarbeitung auf dieser Website ist:

{firma}, {strasse}, {plz} {ort}, {land}
E-Mail: {email}, Telefon: {telefon}

## 2. Allgemeines zur Datenverarbeitung

Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist. Die Verarbeitung erfolgt auf Grundlage der Datenschutz-Grundverordnung (DSGVO) und des Datenschutzgesetzes (DSG).

## 3. Hosting und technische Infrastruktur

Unsere Website wird bei Vercel Inc. (USA) gehostet. Datenbank- und Speicherdienste nutzen Google Firebase / Google Cloud (irische Niederlassung bzw. EU-Region, soweit konfiguriert). Mit den Anbietern bestehen Auftragsverarbeitungsverträge gemäß Art. 28 DSGVO. Soweit Daten in Drittländer übermittelt werden, erfolgt dies auf Basis geeigneter Garantien (z. B. EU-Standardvertragsklauseln).

## 4. Server-Logfiles

Beim Aufruf der Website werden durch den Hosting-Anbieter automatisch Informationen erfasst (Browsertyp, Betriebssystem, Referrer-URL, Hostname, Uhrzeit der Serveranfrage, IP-Adresse). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der sicheren Bereitstellung der Website).

## 5. Cookies und lokale Speicherung

Wir verwenden technisch notwendige Cookies bzw. lokale Speicher (localStorage) für:

- Warenkorb und Bestellprozess
- Anmeldestatus (Firebase Authentication)
- Ihre Cookie-Einwilligung

Optionale Speicherungen (z. B. Darstellungseinstellungen der PWA) setzen wir nur mit Ihrer Einwilligung ein. Details und Widerrufsmöglichkeit finden Sie im Cookie-Banner sowie unter „Cookie-Einstellungen“ im Footer.

Rechtsgrundlagen: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) bzw. lit. b und f DSGVO (Vertragserfüllung / berechtigtes Interesse) für notwendige Technologien.

## 6. Kontaktformular

Wenn Sie uns per Kontaktformular Anfragen senden, verarbeiten wir die von Ihnen eingegebenen Daten (Name, E-Mail, Betreff, Nachricht) zur Bearbeitung Ihrer Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) bzw. lit. f DSGVO (berechtigtes Interesse an der Kommunikation).

## 7. Kundenkonto und Bestellabwicklung

Bei Registrierung und Bestellung verarbeiten wir die für Vertragsschluss und -abwicklung erforderlichen Daten (Stammdaten, Lieferadresse, Bestellhistorie, Zahlungsinformationen soweit erforderlich). Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.

Rechnungs- und Buchhaltungsunterlagen speichern wir gemäß den gesetzlichen Aufbewahrungsfristen (u. a. BAO, UGB).

## 8. POS-/Kassa-Verkauf

Bei Verkäufen über unsere Kassa vor Ort verarbeiten wir die für den Kassenbeleg und die gesetzliche Dokumentationspflicht erforderlichen Daten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und c DSGVO.

## 9. Ihre Rechte

Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen die Verarbeitung, soweit die gesetzlichen Voraussetzungen vorliegen. Erteilte Einwilligungen können Sie jederzeit mit Wirkung für die Zukunft widerrufen.

## 10. Beschwerderecht

Sie haben das Recht, Beschwerde bei der österreichischen Datenschutzbehörde einzulegen:
Barichgasse 40–42, 1030 Wien, www.dsb.gv.at`;

const AGB_ONLINE_BODY = `## 1. Geltungsbereich

Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen über den Online-Shop von {firma} ({website}) durch Verbraucher und Unternehmer, sofern nicht ausdrücklich etwas anderes vereinbart wurde.

## 2. Vertragspartner

Vertragspartner ist {firma}, {strasse}, {plz} {ort}, UID: {uid}.

## 3. Vertragsschluss

Die Darstellung der Produkte stellt kein rechtlich bindendes Angebot dar, sondern eine unverbindliche Aufforderung zur Bestellung. Mit Absenden der Bestellung geben Sie ein verbindliches Angebot ab. Der Vertrag kommt zustande, wenn wir Ihre Bestellung durch eine Auftragsbestätigung per E-Mail annehmen oder die Ware versenden.

## 4. Preise und Zahlung

Alle Preise verstehen sich in Euro inklusive der gesetzlichen Umsatzsteuer. Zusätzlich anfallende Versandkosten werden vor Abschluss der Bestellung ausgewiesen.

Zahlungsarten: Überweisung und/oder QR-Code-Zahlung gemäß Angaben im Checkout. Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum, soweit gesetzlich zulässig.

## 5. Lieferung und Versand

Lieferung an die von Ihnen angegebene Adresse innerhalb Österreichs und – soweit angeboten – in andere Länder. Lieferzeiten sind unverbindlich, sofern nicht ausdrücklich als verbindlich zugesagt.

## 6. Eigentumsvorbehalt

Die gelieferte Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.

## 7. Gewährleistung

Es gelten die gesetzlichen Gewährleistungsrechte. Bei Verbrauchern beträgt die Verjährungsfrist für Mängelansprüche zwei Jahre ab Übergabe der Ware.

## 8. Haftung

Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit. Im Übrigen haften wir nur bei Verletzung wesentlicher Vertragspflichten, begrenzt auf den vorhersehbaren, vertragstypischen Schaden.

## 9. Widerrufsrecht

Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Details entnehmen Sie unserer Widerrufsbelehrung unter /widerruf.

## 10. Streitbeilegung

Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: https://ec.europa.eu/consumers/odr/

Wir sind nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.

## 11. Anwendbares Recht

Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts. Zwingende Verbraucherschutzvorschriften des Staates, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat, bleiben unberührt.`;

const AGB_POS_BODY = `## 1. Geltungsbereich

Diese Bedingungen gelten für den Kauf von Waren im direkten Verkauf an der Kassa bzw. in der Werkstatt von {firma} ({strasse}, {plz} {ort}).

## 2. Vertragsschluss

Der Kaufvertrag kommt mit Bezahlung und Übergabe der Ware bzw. Ausstellung des Kassenbelegs zustande.

## 3. Preise

Alle angegebenen Preise verstehen sich in Euro inklusive der gesetzlichen Umsatzsteuer.

## 4. Zahlung

Zahlung erfolgt vor Ort in bar, per Kartenzahlung oder in den angebotenen elektronischen Zahlungsformen.

## 5. Gewährleistung

Es gelten die gesetzlichen Gewährleistungsrechte. Mängel sind unverzüglich anzuzeigen.

## 6. Widerrufsrecht

Bei Käufen im Ladengeschäft vor Ort besteht kein gesetzliches Widerrufsrecht nach Fern- und Auswärtsgeschäfte-Gesetz (FAGG), da es sich nicht um einen Fernabsatzvertrag handelt.

## 7. Haftung

Wir haften nach den gesetzlichen Bestimmungen, insbesondere bei Vorsatz und grober Fahrlässigkeit unbeschränkt.

## 8. Anwendbares Recht

Es gilt österreichisches Recht.`;

const WITHDRAWAL_BODY = `## Widerrufsbelehrung für Verbraucher (Online-Bestellungen)

Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.

Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter die letzte Ware in Besitz genommen haben.

Um Ihr Widerrufsrecht auszuüben, müssen Sie uns

{firma}
{strasse}
{plz} {ort}
E-Mail: {email}

mittels einer eindeutigen Erklärung (z. B. per E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.

## Folgen des Widerrufs

Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme zusätzlicher Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei uns eingegangen ist.

Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.

## Ausschluss des Widerrufsrechts

Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von Waren, die nach Kundenspezifikation angefertigt werden oder eindeutig auf die persönlichen Bedürfnisse zugeschnitten sind (§ 18 Abs. 1 Z 3 FAGG).

## Muster-Widerrufsformular

(Wenn Sie den Vertrag widerrufen wollen, füllen Sie dieses Formular aus und senden Sie es zurück.)

An {firma}, {email}:

Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über den Kauf der folgenden Waren:
Bestellt am / erhalten am:
Name des Verbrauchers:
Anschrift:
Unterschrift (nur bei Mitteilung auf Papier):
Datum:`;

export const DEFAULT_LEGAL_CONTENT: LegalContent = {
  impressum: {
    title: "Impressum",
    lastUpdated: "2026-07-10",
    body: IMPRESSUM_BODY,
  },
  privacy: {
    title: "Datenschutzerklärung",
    lastUpdated: "2026-07-10",
    body: PRIVACY_BODY,
  },
  agbOnline: {
    title: "Allgemeine Geschäftsbedingungen – Online-Shop",
    lastUpdated: "2026-07-10",
    body: AGB_ONLINE_BODY,
  },
  agbPos: {
    title: "Allgemeine Geschäftsbedingungen – Kassa / Ladengeschäft",
    lastUpdated: "2026-07-10",
    body: AGB_POS_BODY,
  },
  withdrawal: {
    title: "Widerrufsbelehrung",
    lastUpdated: "2026-07-10",
    body: WITHDRAWAL_BODY,
  },
  cookieBanner: {
    policyVersion: 1,
    title: "Cookies & Datenschutz",
    description:
      "Wir verwenden technisch notwendige Speicherungen für Warenkorb, Anmeldung und Sicherheit. Optionale Einstellungen (z. B. Darstellung) setzen wir nur mit Ihrer Einwilligung. Details in unserer Datenschutzerklärung.",
    acceptAllLabel: "Alle akzeptieren",
    rejectOptionalLabel: "Nur notwendige",
    customizeLabel: "Einstellungen",
    saveLabel: "Auswahl speichern",
    privacyLinkLabel: "Datenschutz",
    impressumLinkLabel: "Impressum",
    necessary: {
      title: "Notwendig",
      description:
        "Erforderlich für Warenkorb, Bestellung, Anmeldung und die Speicherung Ihrer Cookie-Einstellung. Ohne diese Funktionen ist der Shop nicht nutzbar.",
    },
    functional: {
      title: "Komfort / Darstellung",
      description:
        "Speichert optionale Einstellungen wie das Erscheinungsbild der App (Hell/Dunkel) auf Ihrem Gerät.",
    },
    analytics: {
      title: "Statistik",
      description:
        "Derzeit werden keine Analyse- oder Marketing-Cookies eingesetzt. Diese Kategorie ist für künftige Erweiterungen vorgesehen.",
    },
  },
  footer: {
    sectionTitle: "Rechtliches",
    links: [
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
      { label: "AGB Online-Shop", href: "/agb" },
      { label: "AGB Kassa", href: "/agb-kassa" },
      { label: "Widerruf", href: "/widerruf" },
    ],
  },
  checkout: {
    agbLabel:
      "Ich habe die AGB und die Widerrufsbelehrung gelesen und akzeptiere sie.",
    withdrawalLabel:
      "Ich bestätige, dass ich Verbraucher bin und die Widerrufsbelehrung zur Kenntnis genommen habe.",
    privacyNote:
      "Informationen zur Verarbeitung Ihrer Daten finden Sie in unserer Datenschutzerklärung.",
    errorMessage: "Bitte akzeptieren Sie die AGB und Widerrufsbelehrung.",
  },
  posNotice:
    "Verkauf gemäß AGB Kassa / Ladengeschäft. Bei Käufen vor Ort besteht kein Widerrufsrecht nach FAGG.",
};

export function applyLegalPlaceholders(text: string, company: CompanySettings): string {
  const website = company.website.startsWith("http")
    ? company.website
    : `https://${company.website.replace(/^www\./, "")}`;

  return text
    .replaceAll("{firma}", company.name)
    .replaceAll("{company.name}", company.name)
    .replaceAll("{strasse}", company.street)
    .replaceAll("{plz}", company.zip)
    .replaceAll("{ort}", company.city)
    .replaceAll("{land}", company.country)
    .replaceAll("{email}", company.email)
    .replaceAll("{telefon}", company.phone)
    .replaceAll("{website}", website)
    .replaceAll("{uid}", company.uid)
    .replaceAll("{firmenbuch}", company.firmenbuch || "—")
    .replaceAll("{datum}", new Date().toLocaleDateString("de-AT"));
}

export function mergeLegalContent(partial?: Partial<LegalContent> | null): LegalContent {
  if (!partial) return DEFAULT_LEGAL_CONTENT;

  const merge = <T>(defaults: T, override: unknown): T => {
    if (override === undefined || override === null) return defaults;
    if (Array.isArray(defaults)) {
      return (Array.isArray(override) && override.length > 0 ? override : defaults) as T;
    }
    if (typeof defaults === "object" && defaults !== null && !Array.isArray(defaults)) {
      const def = defaults as Record<string, unknown>;
      const ov = override as Record<string, unknown>;
      const result = { ...def };
      for (const key of Object.keys(def)) {
        result[key] = merge(def[key], ov[key]);
      }
      for (const key of Object.keys(ov)) {
        if (!(key in result)) result[key] = ov[key];
      }
      return result as T;
    }
    return override as T;
  };

  return merge(DEFAULT_LEGAL_CONTENT, partial);
}
