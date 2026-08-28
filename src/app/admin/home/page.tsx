import { db } from "@/lib/db";
import { getAnnouncementBar, getCustomBanner, getHomeContent, getSectionTitles, getSlides } from "@/lib/settings";
import HomeForm from "./home-form";
import SlidesEditor from "./slides-editor";
import CustomBannerEditor from "./custom-banner-editor";
import SectionTitlesEditor from "./section-titles-editor";
import AnnouncementEditor from "./announcement-editor";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [home, slides, banner, sectionTitles, bar, categories] = await Promise.all([
    getHomeContent(),
    getSlides(),
    getCustomBanner(),
    getSectionTitles(),
    getAnnouncementBar(),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">
        Homepage content
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Edit the hero section and slideshow visitors see first.
      </p>
      <HomeForm initial={home} />
      <SlidesEditor initial={slides} categories={categories} />
      <AnnouncementEditor initial={bar} />
      <SectionTitlesEditor initial={sectionTitles} />
      <CustomBannerEditor initial={banner} />
    </div>
  );
}
