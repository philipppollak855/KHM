"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandaloneApp =
    pathname?.startsWith("/pos") || pathname?.startsWith("/admin");

  if (isStandaloneApp) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </>
  );
}
