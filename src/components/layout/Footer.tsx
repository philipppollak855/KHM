"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-wood-dark text-linen mt-auto">
      <div className="h-px bg-gradient-to-r from-transparent via-wheat/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 border border-linen/20 flex items-center justify-center font-display text-base font-light">
                K
              </div>
              <div>
                <p className="font-display text-lg font-light tracking-wide">
                  Kevin&apos;s Handmade
                </p>
                <p className="text-[10px] text-linen/40 tracking-[0.25em] uppercase">
                  Manufactur · Schneebergland
                </p>
              </div>
            </div>
            <p className="text-linen/50 text-sm leading-relaxed max-w-sm">
              Handgemachte Unikate aus dem Herzen Niederösterreichs — mit
              Respekt vor Material, Tradition und Natur.
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-wheat/70 mb-5">
              Navigation
            </h3>
            <ul className="space-y-3 text-sm text-linen/50">
              <li>
                <Link href="/shop" className="hover:text-linen transition-colors">
                  Kollektion
                </Link>
              </li>
              <li>
                <Link href="/ueber-uns" className="hover:text-linen transition-colors">
                  Über uns
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-linen transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-linen transition-colors">
                  Kundenbereich
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-wheat/70 mb-5">
              Kontakt
            </h3>
            <ul className="space-y-4 text-sm text-linen/50">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-wheat/50 shrink-0 mt-0.5" strokeWidth={1.5} />
                Schneebergland, Niederösterreich
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-wheat/50 shrink-0" strokeWidth={1.5} />
                info@khm-handmade.at
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-wheat/50 shrink-0" strokeWidth={1.5} />
                +43 000 000 000
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-linen/8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-linen/30 tracking-wider">
          <p>© {new Date().getFullYear()} Kevin&apos;s Handmade Manufactur</p>
          <p className="uppercase">Mit Hand gemacht im Schneebergland</p>
        </div>
      </div>
    </footer>
  );
}
