import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KHM Kassa",
    short_name: "Kassa",
    description: "Mobile Kassa für Kevin's Handmade Manufactur",
    start_url: "/pos",
    scope: "/pos",
    display: "standalone",
    orientation: "portrait",
    background_color: "#2c2118",
    theme_color: "#3d4f32",
    lang: "de",
    icons: [
      {
        src: "/icons/kassa-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/kassa-icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
