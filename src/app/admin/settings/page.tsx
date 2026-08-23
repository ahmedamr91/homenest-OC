import { getSiteSettings } from "@/lib/settings";
import SettingsForm from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Store settings</h1>
      <p className="mt-1 text-sm text-ink/60">
        Shipping fees, free-shipping threshold and the returns policy — changes
        go live everywhere instantly.
      </p>
      <SettingsForm initial={settings} />
    </div>
  );
}
