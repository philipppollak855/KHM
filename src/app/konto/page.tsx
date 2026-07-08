"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, User, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  {
    href: "/konto/bestellungen",
    icon: Package,
    title: "Meine Bestellungen",
    description: "Bestellverlauf und Status einsehen",
  },
  {
    href: "/konto/profil",
    icon: User,
    title: "Mein Profil",
    description: "Persönliche Daten verwalten",
  },
  {
    href: "/konto/rechnungen",
    icon: FileText,
    title: "Meine Rechnungen",
    description: "Rechnungen herunterladen und einsehen",
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
        <p className="text-wood/60">Laden...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-wood-dark mb-2">
          Mein Konto
        </h1>
        <p className="text-wood/60">
          Willkommen, {user.displayName || user.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menuItems.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group p-6 bg-cream rounded-2xl border border-wood/10 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center mb-4 group-hover:bg-forest/20 transition-colors">
              <Icon className="w-6 h-6 text-forest" />
            </div>
            <h2 className="font-display text-lg font-semibold text-wood-dark mb-1">
              {title}
            </h2>
            <p className="text-sm text-wood/60">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
