"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-wood-dark text-cream mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-wood flex items-center justify-center font-display text-lg font-bold">
                K
              </div>
              <div>
                <p className="font-display text-lg font-bold">Kevin&apos;s Handmade</p>
                <p className="text-xs text-cream/60 tracking-widest uppercase">
                  Manufactur
                </p>
              </div>
            </div>
            <p className="text-cream/70 text-sm leading-relaxed">
              Handgemachte Produkte aus dem Herzen des Schneeberglandes.
              Mit Liebe, Tradition und regionalen Materialien gefertigt.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-moss" />
              Navigation
            </h3>
            <ul className="space-y-2 text-sm text-cream/70">
              <li>
                <Link href="/shop" className="hover:text-cream transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/ueber-uns" className="hover:text-cream transition-colors">
                  Über uns
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-cream transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-cream transition-colors">
                  Kundenbereich
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Kontakt</h3>
            <ul className="space-y-3 text-sm text-cream/70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-moss shrink-0" />
                Schneebergland, Niederösterreich
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-moss shrink-0" />
                info@khm-handmade.at
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-moss shrink-0" />
                +43 000 000 000
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-cream/10 text-center text-xs text-cream/50">
          © {new Date().getFullYear()} Kevin&apos;s Handmade Manufactur (KHM).
          Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
