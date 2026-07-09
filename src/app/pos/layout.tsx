import type { Metadata } from "next";
import PosLayoutGuard from "./PosLayoutGuard";

export const metadata: Metadata = {
  title: "KHM Kassa",
  description: "Mobile Kassa – Kevin's Handmade Manufactur",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KHM Kassa",
  },
};

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return <PosLayoutGuard>{children}</PosLayoutGuard>;
}
