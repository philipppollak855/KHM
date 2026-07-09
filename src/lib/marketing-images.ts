const UNSPLASH_PARAMS = {
  product: "?w=600&q=80&auto=format&fit=crop",
  landingWide: "?w=1920&q=85&auto=format&fit=crop",
  landingPortrait: "?w=800&q=85&auto=format&fit=crop",
} as const;

export function unsplashImage(
  photoId: string,
  variant: keyof typeof UNSPLASH_PARAMS = "product"
) {
  return `https://images.unsplash.com/${photoId}${UNSPLASH_PARAMS[variant]}`;
}

/** Geprüfte Marketing-Bilder für Landingpage */
export const LANDING_IMAGES = {
  heroForest: unsplashImage("photo-1441974231531-c6227db76b6e", "landingWide"),
  philosophyWorkshop: unsplashImage(
    "photo-1779031242509-af360178ebb3",
    "landingPortrait"
  ),
  quoteNature: unsplashImage("photo-1518176258769-f227c798150e", "landingWide"),
} as const;

/**
 * Produktbilder nach Slug – nur geprüfte, thematisch passende Motive.
 * Keys entsprechen slugify(Produktname) aus seed.ts.
 */
export const SAMPLE_PRODUCT_IMAGES: Record<string, string> = {
  "handgedrechselte-holzschale": unsplashImage("photo-1651589822716-2bb531112b8a"),
  "schneidebrett-eiche": unsplashImage("photo-1682530016841-2d191010bd1a"),
  "holzherz-anhaenger": unsplashImage("photo-1594323713852-9626155bfd37"),
  "filz-sitzkissen-rund": unsplashImage("photo-1685122121706-a7d632dec1df"),
  "filz-untersetzer-set-4-stk": unsplashImage("photo-1754606581556-f1ce15df35b8"),
  "wolldecke-schneebergland": unsplashImage("photo-1731404247714-f19f610b32d4"),
  "adventskranz-handgebunden": unsplashImage("photo-1765724517986-b2f675d0d4a0"),
  "kerzenhalter-aus-treibholz": unsplashImage("photo-1603905179139-db12ab535ca9"),
  "geschenkset-schneebergland": unsplashImage("photo-1639562954961-0aa228b27c62"),
};

export function getSampleProductImage(slug: string) {
  return SAMPLE_PRODUCT_IMAGES[slug];
}
