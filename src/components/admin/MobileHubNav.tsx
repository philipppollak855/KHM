"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  adminNavHubs,
  isNavGroupActive,
  isNavLinkActive,
  type AdminNavGroup,
  type AdminNavHubId,
} from "@/lib/admin-nav";

function HubSubLink({
  href,
  icon: Icon,
  label,
  pathname,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isNavLinkActive(pathname, href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium touch-manipulation transition-colors ${
        active
          ? "bg-forest text-cream"
          : "text-cream/75 hover:bg-cream/10 hover:text-cream"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
      <span className="flex-1 truncate">{label}</span>
      <ChevronRight className={`w-4 h-4 shrink-0 opacity-40 ${active ? "opacity-80" : ""}`} />
    </Link>
  );
}

function HubGroupCard({
  group,
  pathname,
  expanded,
  onToggle,
  onNavigate,
}: {
  group: AdminNavGroup;
  pathname: string;
  expanded: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const active = isNavGroupActive(pathname, group);
  const Icon = group.icon;

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-colors ${
        active ? "border-forest/50 bg-forest/10" : "border-cream/10 bg-cream/[0.03]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-4 text-left touch-manipulation"
        aria-expanded={expanded}
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            active ? "bg-forest text-cream" : "bg-cream/10 text-cream/80"
          }`}
        >
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-medium text-cream">{group.label}</span>
          <span className="block text-xs text-cream/45 mt-0.5">
            {group.items.length} Bereiche
          </span>
        </span>
        <ChevronRight
          className={`w-5 h-5 shrink-0 text-cream/40 transition-transform ${
            expanded ? "rotate-90" : ""
          }`}
        />
      </button>
      {expanded && (
        <div className="border-t border-cream/10 px-2 py-2 space-y-1 bg-black/15">
          {group.items.map((item) => (
            <HubSubLink
              key={item.href}
              {...item}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HubDirectLink({
  href,
  icon: Icon,
  label,
  pathname,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isNavLinkActive(pathname, href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-4 touch-manipulation transition-colors ${
        active
          ? "border-forest/50 bg-forest text-cream"
          : "border-cream/10 bg-cream/[0.03] text-cream/80 hover:bg-cream/10 hover:text-cream"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          active ? "bg-cream/15" : "bg-cream/10"
        }`}
      >
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </span>
      <span className="flex-1 font-medium">{label}</span>
      <ChevronRight className="w-5 h-5 shrink-0 opacity-40" />
    </Link>
  );
}

export default function MobileHubNav({
  onNavigate,
  focusHub,
}: {
  onNavigate?: () => void;
  focusHub?: AdminNavHubId | null;
}) {
  const pathname = usePathname() || "/";
  const [expandedHub, setExpandedHub] = useState<AdminNavHubId | null>(null);

  useEffect(() => {
    if (focusHub) {
      setExpandedHub(focusHub);
      return;
    }
    for (const entry of adminNavHubs) {
      if (entry.type === "group" && isNavGroupActive(pathname, entry)) {
        setExpandedHub(entry.id);
        return;
      }
    }
    setExpandedHub(null);
  }, [focusHub, pathname]);

  const toggleHub = (id: AdminNavHubId) => {
    setExpandedHub((prev) => (prev === id ? null : id));
  };

  return (
    <nav className="flex-1 overflow-y-auto p-4 space-y-2.5" aria-label="Hauptnavigation">
      <p className="px-1 pb-1 text-[10px] uppercase tracking-[0.28em] text-cream/40">
        Hauptmenü
      </p>
      {adminNavHubs.map((entry) => {
        if (entry.type === "link") {
          return (
            <HubDirectLink
              key={entry.href}
              href={entry.href}
              icon={entry.icon}
              label={entry.label}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          );
        }

        return (
          <HubGroupCard
            key={entry.id}
            group={entry}
            pathname={pathname}
            expanded={expandedHub === entry.id}
            onToggle={() => toggleHub(entry.id)}
            onNavigate={onNavigate}
          />
        );
      })}
    </nav>
  );
}
