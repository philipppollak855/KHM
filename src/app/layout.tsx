import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CompanyBrandingProvider } from "@/context/CompanyBrandingContext";
import LayoutShell from "@/components/layout/LayoutShell";
import { getCompanySettingsServer } from "@/lib/company-server";
import { getPwaShortName } from "@/lib/branding-image";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanySettingsServer();
  const iconUrl = company.pwaIconUrl || company.logoUrl;

  return {
    title: `${company.name} | Handgemacht aus dem Schneebergland`,
    description:
      company.tagline ||
      "Handgemachte Produkte aus dem Herzen des Schneeberglandes. Mit Liebe, Tradition und regionalen Materialien gefertigt.",
    keywords: [
      "handgemacht",
      "Schneebergland",
      company.name,
      "regional",
      "Holz",
      "Natur",
    ],
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: getPwaShortName(company.name),
    },
    icons: iconUrl
      ? {
          icon: [{ url: iconUrl }],
          apple: [{ url: iconUrl, sizes: "180x180" }],
        }
      : {
          apple: [{ url: "/icons/kassa-icon.svg" }],
        },
    formatDetection: {
      telephone: false,
    },
  };
}

export const viewport = {
  themeColor: "#3d4f32",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${cormorant.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col wood-texture">
        <AuthProvider>
          <CompanyBrandingProvider>
            <CartProvider>
              <LayoutShell>{children}</LayoutShell>
            </CartProvider>
          </CompanyBrandingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
