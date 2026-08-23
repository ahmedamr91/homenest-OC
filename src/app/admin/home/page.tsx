import { getHomeContent } from "@/lib/settings";
import HomeForm from "./home-form";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const home = await getHomeContent();
  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">
        Homepage content
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Edit the hero section visitors see first.
      </p>
      <HomeForm initial={home} />
    </div>
  );
}
