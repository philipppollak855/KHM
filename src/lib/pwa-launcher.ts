import {
  LayoutDashboard,
  Smartphone,
  ShoppingCart,
  FileText,
  Users,
  Mail,
  AlertTriangle,
  Package,
  FolderTree,
  Boxes,
  Truck,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type PwaLauncherModule = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Tailwind gradient stops for the icon tile */
  tile: string;
  glow: string;
};

export type PwaLauncherPage = {
  id: string;
  title: string;
  subtitle: string;
  modules: PwaLauncherModule[];
};

export const pwaLauncherPages: PwaLauncherPage[] = [
  {
    id: "quick",
    title: "Schnellzugriff",
    subtitle: "Tägliche Aufgaben",
    modules: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        tile: "from-wheat via-amber-600/90 to-orange-800",
        glow: "shadow-wheat/25",
      },
      {
        href: "/pos",
        label: "Kassa",
        icon: Smartphone,
        tile: "from-emerald-400/90 via-forest-light to-forest",
        glow: "shadow-emerald-500/30",
      },
      {
        href: "/admin/bestellungen",
        label: "Bestellungen",
        icon: ShoppingCart,
        tile: "from-lime-300/80 via-moss to-forest",
        glow: "shadow-lime-400/20",
      },
      {
        href: "/admin/rechnungen",
        label: "Rechnungen",
        icon: FileText,
        tile: "from-sage via-forest-light/90 to-forest",
        glow: "shadow-sage/25",
      },
    ],
  },
  {
    id: "sales",
    title: "Verkauf",
    subtitle: "Kunden & Kommunikation",
    modules: [
      {
        href: "/admin/kunden",
        label: "Kunden",
        icon: Users,
        tile: "from-sky-300/80 via-teal-600/90 to-forest",
        glow: "shadow-sky-400/20",
      },
      {
        href: "/admin/kontaktanfragen",
        label: "Kontakt",
        icon: Mail,
        tile: "from-violet-300/70 via-indigo-600/80 to-wood-dark",
        glow: "shadow-violet-400/20",
      },
      {
        href: "/admin/mahnungen",
        label: "Mahnwesen",
        icon: AlertTriangle,
        tile: "from-amber-300/80 via-orange-600/90 to-red-900/80",
        glow: "shadow-amber-400/25",
      },
      {
        href: "/admin/produkte",
        label: "Produkte",
        icon: Package,
        tile: "from-stone-200/70 via-bark to-wood",
        glow: "shadow-stone-400/15",
      },
    ],
  },
  {
    id: "ops",
    title: "Betrieb",
    subtitle: "Sortiment & Einstellungen",
    modules: [
      {
        href: "/admin/kategorien",
        label: "Kategorien",
        icon: FolderTree,
        tile: "from-green-300/70 via-forest-light to-wood-dark",
        glow: "shadow-green-400/20",
      },
      {
        href: "/admin/lager",
        label: "Lager",
        icon: Boxes,
        tile: "from-cyan-200/70 via-teal-700/80 to-forest",
        glow: "shadow-cyan-400/20",
      },
      {
        href: "/admin/versand",
        label: "Versand",
        icon: Truck,
        tile: "from-blue-300/70 via-slate-600/90 to-wood-dark",
        glow: "shadow-blue-400/20",
      },
      {
        href: "/admin/einstellungen",
        label: "Einstellungen",
        icon: Settings,
        tile: "from-neutral-300/60 via-stone-500/80 to-wood-dark",
        glow: "shadow-neutral-400/15",
      },
    ],
  },
];

export function getPwaGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return "Gute Nacht";
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}
