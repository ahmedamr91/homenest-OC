// Site-wide editable settings, stored in the Setting table (JSON per key).
// Falls back to defaults when unset — the store always works out of the box.
import { db } from "./db";

export type ShippingSettings = {
  freeShippingThreshold: number;
  flatShippingFee: number;
  cityFees: Record<string, number>;
  returnsDays: number;
  returnsNote: string;
  whatsappBot: boolean;
};

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  freeShippingThreshold: 3000,
  flatShippingFee: 60,
  cityFees: {
    Cairo: 50,
    Giza: 55,
    Qalyubia: 60,
    Alexandria: 65,
    Beheira: 65,
    Gharbia: 65,
    Dakahlia: 65,
    Damietta: 70,
    "Kafr El Sheikh": 65,
    Sharqia: 65,
    Monufia: 60,
    "Port Said": 75,
    Ismailia: 75,
    Suez: 75,
    Fayoum: 70,
    "Beni Suef": 70,
    Minya: 75,
    Asyut: 80,
    Sohag: 85,
    Qena: 90,
    Luxor: 95,
    Aswan: 100,
    "Red Sea": 110,
    Matrouh: 110,
    "New Valley": 120,
    "North Sinai": 110,
    "South Sinai": 110,
  },
  returnsDays: 30,
  returnsNote: "30 days, no questions asked",
  whatsappBot: false,
};

const KEY = "shipping";

export type HomeContent = {
  heroBadge: string;
  headlineStart: string;
  headlineAccent: string;
  headlineEnd: string;
  heroText: string;
};

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroBadge: "New season · New colors",
  headlineStart: "Beautiful things make a",
  headlineAccent: "house",
  headlineEnd: "a home.",
  heroText:
    "Lamps, vases, cushions and mirrors — every piece available in the colors that fit your space. Choose yours.",
};

const HOME_KEY = "home";

export async function getHomeContent(): Promise<HomeContent> {
  try {
    const row = await db.setting.findUnique({ where: { key: HOME_KEY } });
    if (!row) return DEFAULT_HOME_CONTENT;
    const parsed = JSON.parse(row.value) as Partial<HomeContent>;
    const merged = { ...DEFAULT_HOME_CONTENT, ...parsed };
    return {
      heroBadge: parsed.heroBadge?.trim() || DEFAULT_HOME_CONTENT.heroBadge,
      headlineStart:
        parsed.headlineStart?.trim() || DEFAULT_HOME_CONTENT.headlineStart,
      headlineAccent:
        parsed.headlineAccent?.trim() || DEFAULT_HOME_CONTENT.headlineAccent,
      headlineEnd: parsed.headlineEnd ?? DEFAULT_HOME_CONTENT.headlineEnd,
      heroText: parsed.heroText?.trim() || DEFAULT_HOME_CONTENT.heroText,
    };
  } catch {
    return DEFAULT_HOME_CONTENT;
  }
}

export async function saveHomeContent(next: HomeContent): Promise<void> {
  await db.setting.upsert({
    where: { key: HOME_KEY },
    update: { value: JSON.stringify(next) },
    create: { key: HOME_KEY, value: JSON.stringify(next) },
  });
}

export type HeroSlide = {
  imageUrl: string;
  headline: string;
  subtext: string;
  buttonText: string;
  href: string;
  /** Artwork brightness — picks text color & scrim. Defaults to "dark". */
  theme?: "dark" | "light";
};

const SLIDES_KEY = "slides";

export async function getSlides(): Promise<HeroSlide[]> {
  try {
    const row = await db.setting.findUnique({ where: { key: SLIDES_KEY } });
    if (!row) return [];
    const parsed = JSON.parse(row.value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is HeroSlide =>
        s &&
        typeof s.imageUrl === "string" &&
        typeof s.buttonText === "string" &&
        typeof s.href === "string"
    );
  } catch {
    return [];
  }
}

export async function saveSlides(next: HeroSlide[]): Promise<void> {
  await db.setting.upsert({
    where: { key: SLIDES_KEY },
    update: { value: JSON.stringify(next) },
    create: { key: SLIDES_KEY, value: JSON.stringify(next) },
  });
}

export type CustomBanner = {
  /** Optional background photo — empty keeps the plain dark banner. */
  imageUrl: string;
  badge: string;
  headlineStart: string;
  headlineAccent: string;
  subtext: string;
  buttonText: string;
  href: string;
};

export const DEFAULT_CUSTOM_BANNER: CustomBanner = {
  imageUrl: "",
  badge: "New service",
  headlineStart: "Have a piece in mind?",
  headlineAccent: "We'll make it.",
  subtext:
    "Send us a photo of your dream piece, pick your colors, and our makers will bring it to life. Quote within 48 hours.",
  buttonText: "Make it yours",
  href: "/custom",
};

const BANNER_KEY = "customBanner";

export async function getCustomBanner(): Promise<CustomBanner> {
  try {
    const row = await db.setting.findUnique({ where: { key: BANNER_KEY } });
    if (!row) return DEFAULT_CUSTOM_BANNER;
    const parsed = JSON.parse(row.value) as Partial<CustomBanner>;
    const d = DEFAULT_CUSTOM_BANNER;
    return {
      imageUrl: typeof parsed.imageUrl === "string" ? parsed.imageUrl : d.imageUrl,
      badge: parsed.badge?.trim() || d.badge,
      headlineStart: parsed.headlineStart?.trim() || d.headlineStart,
      headlineAccent: parsed.headlineAccent ?? d.headlineAccent,
      subtext: parsed.subtext?.trim() || d.subtext,
      buttonText: parsed.buttonText?.trim() || d.buttonText,
      href: parsed.href?.trim() || d.href,
    };
  } catch {
    return DEFAULT_CUSTOM_BANNER;
  }
}

export async function saveCustomBanner(next: CustomBanner): Promise<void> {
  await db.setting.upsert({
    where: { key: BANNER_KEY },
    update: { value: JSON.stringify(next) },
    create: { key: BANNER_KEY, value: JSON.stringify(next) },
  });
}

export type SectionTitles = {
  shopByRoom: string;
  featuredFavorites: string;
};

export const DEFAULT_SECTION_TITLES: SectionTitles = {
  shopByRoom: "Shop by room & mood",
  featuredFavorites: "Featured favorites",
};

const SECTION_TITLES_KEY = "sectionTitles";

export async function getSectionTitles(): Promise<SectionTitles> {
  try {
    const row = await db.setting.findUnique({ where: { key: SECTION_TITLES_KEY } });
    if (!row) return DEFAULT_SECTION_TITLES;
    const parsed = JSON.parse(row.value) as Partial<SectionTitles>;
    return {
      shopByRoom: parsed.shopByRoom?.trim() || DEFAULT_SECTION_TITLES.shopByRoom,
      featuredFavorites: parsed.featuredFavorites?.trim() || DEFAULT_SECTION_TITLES.featuredFavorites,
    };
  } catch {
    return DEFAULT_SECTION_TITLES;
  }
}

export async function saveSectionTitles(next: SectionTitles): Promise<void> {
  await db.setting.upsert({
    where: { key: SECTION_TITLES_KEY },
    update: { value: JSON.stringify(next) },
    create: { key: SECTION_TITLES_KEY, value: JSON.stringify(next) },
  });
}

export type AnnouncementBar = {
  text: string;
};

export const DEFAULT_ANNOUNCEMENT_BAR: AnnouncementBar = {
  text: "Free shipping on orders over EGP 5,000 · Cash on delivery across Egypt",
};

const ANNOUNCEMENT_KEY = "announcementBar";

export async function getAnnouncementBar(): Promise<AnnouncementBar> {
  try {
    const row = await db.setting.findUnique({ where: { key: ANNOUNCEMENT_KEY } });
    if (!row) return DEFAULT_ANNOUNCEMENT_BAR;
    const parsed = JSON.parse(row.value) as Partial<AnnouncementBar>;
    return {
      text: parsed.text?.trim() || DEFAULT_ANNOUNCEMENT_BAR.text,
    };
  } catch {
    return DEFAULT_ANNOUNCEMENT_BAR;
  }
}

export async function saveAnnouncementBar(next: AnnouncementBar): Promise<void> {
  await db.setting.upsert({
    where: { key: ANNOUNCEMENT_KEY },
    update: { value: JSON.stringify(next) },
    create: { key: ANNOUNCEMENT_KEY, value: JSON.stringify(next) },
  });
}

export async function getSiteSettings(): Promise<ShippingSettings> {
  try {
    const row = await db.setting.findUnique({ where: { key: KEY } });
    if (!row) return DEFAULT_SHIPPING_SETTINGS;
    const parsed = JSON.parse(row.value) as Partial<ShippingSettings>;
    return {
      ...DEFAULT_SHIPPING_SETTINGS,
      ...parsed,
      cityFees: { ...DEFAULT_SHIPPING_SETTINGS.cityFees, ...(parsed.cityFees || {}) },
    };
  } catch {
    return DEFAULT_SHIPPING_SETTINGS;
  }
}

export async function saveSiteSettings(
  next: ShippingSettings
): Promise<void> {
  await db.setting.upsert({
    where: { key: KEY },
    update: { value: JSON.stringify(next) },
    create: { key: KEY, value: JSON.stringify(next) },
  });
}

export function computeShipping(
  city: string | null | undefined,
  subtotalAfterDiscount: number,
  s: ShippingSettings
): number {
  if (subtotalAfterDiscount >= s.freeShippingThreshold) return 0;
  if (!city) return s.flatShippingFee;
  return s.cityFees[city] ?? s.flatShippingFee;
}
