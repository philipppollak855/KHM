import StyledText from "@/components/content/StyledText";
import type { HomePageContent } from "@/lib/site-content";

interface Props {
  content: HomePageContent["craft"];
}

export default function CraftSection({ content }: Props) {
  return (
    <section className="py-28 md:py-36 bg-linen-dark/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <p className="section-label text-bark mb-5">{content.label}</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-wood-dark leading-tight">
            <StyledText text={content.title} italicClassName="italic" />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {content.items.map((item, i) => (
            <div key={item.id} className="relative text-center md:text-left">
              {i < content.items.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(100%+1rem)] w-[calc(100%-2rem)] h-px bg-gradient-to-r from-wheat/40 to-transparent" />
              )}
              <p className="text-[10px] tracking-[0.35em] uppercase text-wheat mb-4">
                {item.step}
              </p>
              <h3 className="font-display text-2xl font-light text-wood-dark mb-4">
                {item.title}
              </h3>
              <p className="text-stone leading-relaxed text-[15px]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
