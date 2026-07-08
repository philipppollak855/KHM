import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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

export const metadata: Metadata = {
  title: "Kevin's Handmade Manufactur | Handgemacht aus dem Schneebergland",
  description:
    "Handgemachte Produkte aus dem Herzen des Schneeberglandes. Mit Liebe, Tradition und regionalen Materialien gefertigt.",
  keywords: [
    "handgemacht",
    "Schneebergland",
    "KHM",
    "Kevin's Handmade",
    "regional",
    "Holz",
    "Natur",
  ],
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
          <CartProvider>
            <Header />
            <main className="flex-1 pt-20">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
