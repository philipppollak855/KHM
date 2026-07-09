import type { MetadataRoute } from "next";

const icon = {
  src: "/icons/kassa-icon.svg",
  sizes: "any",
  type: "image/svg+xml",
} as const;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KHM Verwaltung",
    short_name: "KHM",
    description:
      "Administration und Kassa für Kevin's Handmade Manufactur – Bestellungen, Rechnungen, Lager und POS.",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#2c2118",
    theme_color: "#3d4f32",
    lang: "de",
    categories: ["business", "finance"],
    icons: [
      {
        ...icon,
        purpose: "maskable",
      },
      {
        ...icon,
        purpose: "any",
      },
    ],
    shortcuts: [
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
}
