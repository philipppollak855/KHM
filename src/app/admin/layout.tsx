import type { Metadata, Viewport } from "next";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: "KHM Verwaltung",
  description: "Administration, Bestellungen, Rechnungen und Lager",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KHM Verwaltung",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#3d4f32",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
