# Kevin's Handmade Manufactur (KHM)

Handgemachte Produkte aus dem Schneebergland – Landingpage mit Bestellsystem, Admin- und Kundenbereich.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Firebase (Firestore, Authentication)
- **Hosting:** Vercel

## Lokale Entwicklung

```bash
npm install
cp .env.example .env.local
npm run dev
```

Die App läuft unter [http://localhost:3000](http://localhost:3000).

## Firebase

- **Projekt:** `khm-handmade`
- **Console:** https://console.firebase.google.com/project/khm-handmade

### Firestore deployen

```bash
firebase deploy --only firestore
firebase deploy --only auth
```

## Admin-Zugang

Bei der Registrierung wird die E-Mail aus `NEXT_PUBLIC_ADMIN_EMAIL` automatisch als Admin-Rolle vergeben. Standard: `kevin@khm.at`.

## Beispieldaten

Im Admin-Dashboard (`/admin`) gibt es den Button **„Beispieldaten laden“**, oder per CLI:

```bash
npm run seed
```

## Bild-Upload

Produktbilder können im Admin unter **Produkte** direkt hochgeladen werden (Firebase Storage).

> **Hinweis:** Firebase Storage muss einmalig in der [Firebase Console](https://console.firebase.google.com/project/khm-handmade/storage) aktiviert werden (Blaze-Plan erforderlich, Free Tier verfügbar). Danach: `firebase deploy --only storage`

## Domain

- **khm-handmade.at** und **www.khm-handmade.at** sind bei Vercel konfiguriert
- DNS-Eintrag beim Domain-Registrar: `A` → `76.76.21.21` oder Nameserver auf Vercel umstellen

## Seiten

| Bereich | Pfad |
|---------|------|
| Landingpage | `/` |
| Shop | `/shop` |
| Warenkorb | `/warenkorb` |
| Kasse | `/checkout` |
| Kundenbereich | `/konto` |
| Admin | `/admin` |
