import { getActiveProducts } from "@/lib/firestore";
import HeroSection from "@/components/landing/HeroSection";
import PhilosophySection from "@/components/landing/PhilosophySection";
import ValuesSection from "@/components/landing/ValuesSection";
import CraftSection from "@/components/landing/CraftSection";
import FeaturedSection from "@/components/landing/FeaturedSection";
import QuoteSection, { CtaSection } from "@/components/landing/QuoteSection";

export default async function HomePage() {
  let featuredProducts: Awaited<ReturnType<typeof getActiveProducts>> = [];
  try {
    const products = await getActiveProducts();
    featuredProducts = products.filter((p) => p.featured).slice(0, 3);
    if (featuredProducts.length === 0) {
      featuredProducts = products.slice(0, 3);
    }
  } catch {
    // Firestore may not be ready yet
  }

  return (
    <>
      <HeroSection />
      <PhilosophySection />
      <ValuesSection />
      <CraftSection />
      <FeaturedSection products={featuredProducts} />
      <QuoteSection />
      <CtaSection />
    </>
  );
}
