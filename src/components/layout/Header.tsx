"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { href: "/", label: "Start" },
  { href: "/shop", label: "Kollektion" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const transparent = isHome && !scrolled && !mobileOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        transparent
          ? "bg-transparent border-b border-linen/10"
          : "bg-linen/95 backdrop-blur-md border-b border-wood/8 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className={`w-10 h-10 flex items-center justify-center font-display text-lg font-light border transition-colors duration-300 ${
                transparent
                  ? "border-linen/40 text-linen"
                  : "border-wood/20 text-wood-dark"
              }`}
            >
              K
            </div>
            <div className="hidden sm:block">
              <p
                className={`font-display text-lg font-light leading-tight tracking-wide transition-colors ${
                  transparent ? "text-linen" : "text-wood-dark"
                }`}
              >
                Kevin&apos;s Handmade
              </p>
              <p
                className={`text-[10px] tracking-[0.25em] uppercase transition-colors ${
                  transparent ? "text-linen/50" : "text-stone"
                }`}
              >
                Manufactur
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs tracking-[0.15em] uppercase transition-colors duration-300 ${
                  pathname === link.href
                    ? transparent
                      ? "text-linen border-b border-linen/60 pb-1"
                      : "text-forest border-b border-forest/40 pb-1"
                    : transparent
                      ? "text-linen/70 hover:text-linen"
                      : "text-wood-dark/70 hover:text-wood-dark"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/warenkorb"
              className={`relative p-2.5 transition-colors ${
                transparent ? "text-linen/80 hover:text-linen" : "text-wood-dark hover:text-forest"
              }`}
            >
              <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-wheat text-wood-dark text-[10px] rounded-full flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-1">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`text-xs tracking-wider uppercase px-3 py-2 transition-colors ${
                      transparent ? "text-linen/70 hover:text-linen" : "text-forest hover:text-forest-light"
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/konto"
                  className={`p-2.5 transition-colors ${
                    transparent ? "text-linen/80 hover:text-linen" : "text-wood-dark hover:text-forest"
                  }`}
                >
                  <User className="w-4 h-4" strokeWidth={1.5} />
                </Link>
                <button
                  onClick={() => logout()}
                  className={`p-2.5 transition-colors ${
                    transparent ? "text-linen/80 hover:text-linen" : "text-wood-dark hover:text-forest"
                  }`}
                  title="Abmelden"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`hidden sm:inline-flex text-xs tracking-[0.15em] uppercase px-4 py-2 transition-colors ${
                  transparent
                    ? "text-linen/80 hover:text-linen border border-linen/25 hover:border-linen/50"
                    : "text-wood-dark hover:text-forest border border-wood/15 hover:border-wood/30"
                }`}
              >
                Anmelden
              </Link>
            )}

            <button
              className={`md:hidden p-2.5 transition-colors ${
                transparent ? "text-linen" : "text-wood-dark"
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden pb-6 border-t border-wood/10 pt-4 space-y-1 bg-linen/98 backdrop-blur-md -mx-4 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm tracking-wider uppercase text-wood-dark hover:text-forest transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/konto"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm tracking-wider uppercase text-wood-dark"
                >
                  Mein Konto
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm tracking-wider uppercase text-forest"
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm tracking-wider uppercase text-wood-dark"
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

