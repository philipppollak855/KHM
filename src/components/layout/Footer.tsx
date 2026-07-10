"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import CompanyLogo from "@/components/branding/CompanyLogo";
import { useCompanyBranding } from "@/context/CompanyBrandingContext";
import { useSiteContent } from "@/context/SiteContentContext";
import CookieSettingsButton from "@/components/legal/CookieSettingsButton";

export default function Footer({ className }: { className?: string }) {
  const pathname = usePathname();
  const { company } = useCompanyBranding();
  const { content } = useSiteContent();
  const { navigation } = content;
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className={`bg-wood-dark text-linen mt-auto ${className ?? ""}`}>
      <div className="h-px bg-gradient-to-r from-transparent via-wheat/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div className="mb-6">
              <CompanyLogo variant="full" size="md" dark />
            </div>
            <p className="text-linen/50 text-sm leading-relaxed max-w-sm">
              {company.tagline || "Handgemachte Unikate mit Respekt vor Material, Tradition und Natur."}
            </p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-wheat/70 mb-5">
              {navigation.footer.navigationTitle}
            </h3>
            <ul className="space-y-3 text-sm text-linen/50">
              {navigation.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-linen transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/login" className="hover:text-linen transition-colors">
                  {navigation.footer.customerAreaLabel}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-wheat/70 mb-5">
              {content.legal.footer.sectionTitle}
            </h3>
            <ul className="space-y-3 text-sm text-linen/50">
              {content.legal.footer.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-linen transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookieSettingsButton />
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-wheat/70 mb-5">
              {navigation.footer.contactTitle}
            </h3>
            <ul className="space-y-4 text-sm text-linen/50">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-wheat/50 shrink-0 mt-0.5" strokeWidth={1.5} />
                {company.street}, {company.zip} {company.city}
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-wheat/50 shrink-0" strokeWidth={1.5} />
                {company.email}
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-wheat/50 shrink-0" strokeWidth={1.5} />
                {company.phone}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-linen/8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-linen/30 tracking-wider">
          <p>© {new Date().getFullYear()} {company.name}</p>
          <p className="uppercase">{company.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
