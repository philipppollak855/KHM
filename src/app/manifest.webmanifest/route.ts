import { NextResponse } from "next/server";
import { getCompanySettingsServer } from "@/lib/company-server";
import { getPwaShortName } from "@/lib/branding-image";

export const dynamic = "force-dynamic";

const DEFAULT_ICON = {
  src: "/icons/kassa-icon.svg",
  sizes: "any",
  type: "image/svg+xml",
} as const;

function iconTypeFromUrl(url: string) {
  if (url.endsWith(".svg")) return "image/svg+xml";
  if (url.endsWith(".webp")) return "image/webp";
  if (url.endsWith(".gif")) return "image/gif";
  return "image/png";
}

export async function GET() {
  const company = await getCompanySettingsServer();
  const iconSrc = company.pwaIconUrl || company.logoUrl || DEFAULT_ICON.src;
  const icon =
    iconSrc === DEFAULT_ICON.src
      ? DEFAULT_ICON
      : {
          src: iconSrc,
          sizes: "512x512",
          type: iconTypeFromUrl(iconSrc),
        };

  const manifest = {
    name: `${company.name} Verwaltung`,
    short_name: getPwaShortName(company.name),
    description: `Administration und Kassa für ${company.name} – Bestellungen, Rechnungen, Lager und POS.`,
    start_url: "/admin/start",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#2c2118",
    theme_color: "#3d4f32",
    lang: "de",
    categories: ["business", "finance"],
    icons: [
      { ...icon, purpose: "maskable" },
      { ...icon, purpose: "any" },
    ],
    shortcuts: [
      {
        name: "Startbildschirm",
        short_name: "Start",
        url: "/admin/start",
        icons: [icon],
      },
      {
        name: "Dashboard",
        short_name: "Dashboard",
        url: "/admin",
        icons: [icon],
      },
      {
        name: "Kassa (POS)",
        short_name: "Kassa",
        url: "/pos",
        icons: [icon],
      },
      {
        name: "Bestellungen",
        short_name: "Aufträge",
        url: "/admin/bestellungen",
        icons: [icon],
      },
      {
        name: "Rechnungen",
        short_name: "Rechnungen",
        url: "/admin/rechnungen",
        icons: [icon],
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
