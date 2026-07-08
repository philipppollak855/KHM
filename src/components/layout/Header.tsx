"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { href: "/", label: "Start" },
  { href: "/shop", label: "Shop" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b-2 border-wood/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-wood flex items-center justify-center text-cream font-display text-xl font-bold shadow-md group-hover:shadow-lg transition-shadow">
              K
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-xl font-bold text-wood-dark leading-tight">
                Kevin&apos;s Handmade
              </p>
              <p className="text-xs text-forest tracking-widest uppercase">
                Manufactur · Schneebergland
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-forest ${
                  pathname === link.href
                    ? "text-forest border-b-2 border-forest pb-0.5"
                    : "text-wood-dark"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/warenkorb"
              className="relative p-2 rounded-lg hover:bg-wood/10 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-wood-dark" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-forest text-cream text-xs rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-forest hover:underline"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/konto"
                  className="p-2 rounded-lg hover:bg-wood/10 transition-colors"
                >
                  <User className="w-5 h-5 text-wood-dark" />
                </Link>
                <button
                  onClick={() => logout()}
                  className="p-2 rounded-lg hover:bg-wood/10 transition-colors"
                  title="Abmelden"
                >
                  <LogOut className="w-5 h-5 text-wood-dark" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm font-medium text-wood-dark hover:text-forest transition-colors"
              >
                Anmelden
              </Link>
            )}

            <button
              className="md:hidden p-2 rounded-lg hover:bg-wood/10"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-wood/10 pt-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-wood/10 text-wood-dark font-medium"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/konto"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 rounded-lg hover:bg-wood/10 text-wood-dark font-medium"
                >
                  Mein Konto
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 rounded-lg hover:bg-wood/10 text-forest font-medium"
                  >
                    Admin-Bereich
                  </Link>
                )}
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-wood/10 text-wood-dark font-medium"
              >
                Anmelden
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
