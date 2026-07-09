"use client";

import Image from "next/image";
import { useCompanyBranding } from "@/context/CompanyBrandingContext";

type CompanyLogoProps = {
  variant?: "mark" | "full";
  size?: "sm" | "md" | "lg";
  className?: string;
  transparent?: boolean;
  dark?: boolean;
};

const markSizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const textSizes = {
  sm: { title: "text-base", tagline: "text-[9px]" },
  md: { title: "text-lg", tagline: "text-[10px]" },
  lg: { title: "text-xl", tagline: "text-xs" },
};

export default function CompanyLogo({
  variant = "full",
  size = "md",
  className = "",
  transparent = false,
  dark = false,
}: CompanyLogoProps) {
  const { company } = useCompanyBranding();
  const text = textSizes[size];
  const titleClass = transparent
    ? "text-linen"
    : dark
      ? "text-linen"
      : "text-wood-dark";
  const taglineClass = transparent
    ? "text-linen/50"
    : dark
      ? "text-linen/40"
      : "text-stone";

  const mark = company.logoUrl ? (
    <div className={`relative ${markSizes[size]} shrink-0`}>
      <Image
        src={company.logoUrl}
        alt={company.name}
        fill
        className="object-contain"
        unoptimized={company.logoUrl.includes("firebasestorage")}
      />
    </div>
  ) : (
    <div
      className={`${markSizes[size]} flex items-center justify-center font-display font-light border shrink-0 ${
        transparent
          ? "border-linen/40 text-linen"
          : dark
            ? "border-linen/20 text-linen"
            : "border-wood/20 text-wood-dark"
      }`}
    >
      {company.name.charAt(0).toUpperCase()}
    </div>
  );

  if (variant === "mark") {
    return <div className={className}>{mark}</div>;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {mark}
      <div className="hidden sm:block min-w-0">
        <p className={`font-display font-light leading-tight tracking-wide truncate ${text.title} ${titleClass}`}>
          {company.name}
        </p>
        {company.tagline && (
          <p className={`tracking-[0.25em] uppercase truncate ${text.tagline} ${taglineClass}`}>
            {company.tagline}
          </p>
        )}
      </div>
    </div>
  );
}
