"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, User, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/layout/PageHeader";

const menuItems = [
  {
    href: "/konto/bestellungen",
    icon: Package,
    title: "Meine Bestellungen",
    description: "Auftragsbestätigungen, Lieferscheine und Status",
  },
  {
    href: "/konto/rechnungen",
    icon: FileText,
    title: "Meine Rechnungen",
    description: "Rechnungen als PDF herunterladen",
  },
  {
    href: "/konto/profil",
    icon: User,
    title: "Mein Profil",
    description: "Adresse und Kontaktdaten verwalten",
  },
];

export default function KontoPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-stone">Laden...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader
        label="Kundenbereich"
        title="Mein Konto"
        description={`Willkommen, ${user.displayName || user.email}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menuItems.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group p-6 bg-linen border border-wood/10 hover:border-forest/30 transition-all"
          >
            <div className="w-11 h-11 border border-forest/20 flex items-center justify-center mb-4 group-hover:bg-forest/5 transition-colors">
              <Icon className="w-5 h-5 text-forest" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-lg font-light text-wood-dark mb-1">
              {title}
            </h2>
            <p className="text-sm text-stone leading-relaxed">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
