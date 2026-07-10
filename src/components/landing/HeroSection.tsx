import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import StyledText from "@/components/content/StyledText";
import type { HomePageContent } from "@/lib/site-content";

interface Props {
  content: HomePageContent["hero"];
}

export default function HeroSection({ content }: Props) {
  return (
    <section className="relative min-h-[calc(92vh-5rem)] flex items-center overflow-hidden -mt-20">
      <Image
        src={content.imageUrl}
        alt={content.imageAlt}
        fill
        priority
        className="object-cover scale-105"
        sizes="100vw"
        unoptimized
      />
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(184,149,108,0.08)_0%,transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32 md:py-40">
        <div className="max-w-3xl">
          <p className="section-label text-wheat/90 mb-6 animate-fade-up">{content.label}</p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-linen leading-[1.05] mb-8 animate-fade-up-delay">
            <StyledText text={content.title} italicClassName="italic font-normal text-wheat/95" />
          </h1>
          <p className="text-linen/75 text-lg md:text-xl leading-relaxed max-w-xl mb-12 font-light animate-fade-up-delay-2">
            {content.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-5 animate-fade-up-delay-2">
            <Link
              href={content.primaryCta.href}
              className="inline-flex items-center gap-3 bg-linen text-wood-dark px-8 py-4 text-sm tracking-[0.15em] uppercase font-medium hover:bg-linen-dark transition-colors duration-300"
            >
              {content.primaryCta.label}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={content.secondaryCta.href}
              className="inline-flex items-center gap-2 text-linen/80 text-sm tracking-[0.12em] uppercase hover:text-linen transition-colors border-b border-linen/30 pb-0.5 hover:border-linen/60"
            >
              {content.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-linen/40">
        <span className="text-[10px] tracking-[0.3em] uppercase">{content.scrollHint}</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </div>
    </section>
  );
}
