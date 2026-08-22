import { getInfraStats, getTrafficStats } from "@/lib/infra";
import { ADMIN_EMAIL } from "@/lib/site-config";
import Link from "next/link";

export const dynamic = "force-dynamic";

const FREE_LIMITS = {
  dbBytes: 0.5 * 1024 * 1024 * 1024, // Neon free: 500 MB
  photoBytes: 2 * 1024 * 1024 * 1024, // UploadThing free: 2 GB
  emailsPerMonth: 3000, // Resend free
};

function fmtBytes(b: number): string {
  if (b >= 1024 * 1024 * 1024) return `${(b / 1024 ** 3).toFixed(2)} GB`;
  if (b >= 1024 * 1024) return `${(b / 1024 ** 2).toFixed(1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${b} B`;
}

function level(pct: number): { color: string; bar: string; word: string } {
  if (pct >= 80)
    return { color: "text-red-600", bar: "bg-red-500", word: "Critical" };
  if (pct >= 50)
    return { color: "text-amber-600", bar: "bg-amber-400", word: "Getting high" };
  return { color: "text-emerald-600", bar: "bg-emerald-500", word: "Healthy" };
}

function Meter({
  title,
  sub,
  used,
  limit,
  unit,
}: {
  title: string;
  sub?: string;
  used: number | null;
  limit: number;
  unit: "bytes" | "count";
}) {
  const unknown = used == null;
  const pct = unknown ? 0 : Math.min(100, (used / limit) * 100);
  const lv = level(pct);
  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <span className={`text-xs font-bold uppercase tracking-wider ${unknown ? "text-ink/40" : lv.color}`}>
          {unknown ? "—" : lv.word}
        </span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-sand">
        <div className={`h-full rounded-full transition-all ${unknown ? "bg-ink/20" : lv.bar}`} style={{ width: `${Math.max(2, pct)}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-sm">
        <span className="font-semibold">
          {unknown ? "n/a in dev mode" : unit === "bytes" ? fmtBytes(used!) : used!.toLocaleString()}
        </span>
        <span className="text-ink/50">of {unit === "bytes" ? fmtBytes(limit) : limit.toLocaleString()} free</span>
      </div>
      {sub && <p className="mt-1 text-xs text-ink/50">{sub}</p>}
      {!unknown && pct >= 80 && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium leading-relaxed text-red-700">
          {title.includes("PHOTO")
            ? "Options: upgrade UploadThing ($10/mo → 100 GB) or migrate to Cloudflare R2 (~$2/yr)."
            : title.includes("DATABASE")
              ? "Neon paid plans start ~$19/mo. Old test orders can also be cleaned up."
              : "Resend Pro is $20/mo. Or reduce non-critical emails."}
        </p>
      )}
    </div>
  );
}

export default async function InfraPage() {
  const [s, traffic] = await Promise.all([getInfraStats(), getTrafficStats()]);
  const estBandwidthGB = (traffic.thisMonth * 0.00025); // ~250 KB per visit
  const maxViews = Math.max(...traffic.series.map((d) => d.views), 1);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Infrastructure usage</h1>
      <p className="mt-1 text-sm text-ink/60">
        Live numbers from your free-tier services. Meters turn amber at 50% and red at 80%.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Meter
          title="Database storage"
          sub={`Orders ${s.orderCount} · Products ${s.productCount} · Reviews ${s.reviewCount} · Custom requests ${s.customCount}`}
          used={s.dbSize}
          limit={FREE_LIMITS.dbBytes}
          unit="bytes"
        />
        <Meter
          title="Photo storage"
          sub={`${s.photos.files} files on UploadThing CDN`}
          used={s.photos.ok ? s.photos.bytes : null}
          limit={FREE_LIMITS.photoBytes}
          unit="bytes"
        />
        <Meter
          title="Emails sent this month"
          sub={process.env.RESEND_API_KEY ? `Alerts go to ${process.env.ALERTS_TO || ADMIN_EMAIL}` : "Email sending is OFF — add RESEND_API_KEY to enable"}
          used={s.emailsThisMonth}
          limit={FREE_LIMITS.emailsPerMonth}
          unit="count"
        />
        <div className="card p-6">
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold">Site visits (tracked live)</h3>
            <span className={`text-xs font-bold uppercase tracking-wider ${level((estBandwidthGB / 100) * 100).color}`}>
              {level((estBandwidthGB / 100) * 100).word}
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl text-ink">{traffic.thisMonth.toLocaleString()}</span>
            <span className="text-sm text-ink/50">visits this month</span>
          </div>

          {/* 30-day mini chart */}
          <div className="mt-4 flex h-16 items-end gap-[3px]">
            {traffic.series.map((d, i) => (
              <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
                <div
                  className={`w-full rounded-t-sm ${d.views > 0 ? "bg-moss group-hover:bg-clay" : "bg-sand"}`}
                  style={{ height: d.views > 0 ? `${Math.max(8, (d.views / maxViews) * 100)}%` : "2px" }}
                />
                <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[9px] font-bold text-cream group-hover:block">
                  {d.views} · {d.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-ink/40">
            <span>30 days ago</span>
            <span>Today</span>
          </div>

          <div className="mt-4 border-t border-dashed border-ink/15 pt-3">
            <div className="flex justify-between text-xs">
              <span className="text-ink/60">Estimated bandwidth (~250 KB/visit)</span>
              <span className="font-bold">{estBandwidthGB.toFixed(2)} GB of 100 GB</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand">
              <div
                className={`h-full rounded-full ${estBandwidthGB > 80 ? "bg-red-500" : estBandwidthGB > 50 ? "bg-amber-400" : "bg-emerald-500"}`}
                style={{ width: `${Math.max(2, Math.min(100, (estBandwidthGB / 100) * 100))}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-ink/50">
              Official number lives in the{" "}
              <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="font-medium text-clay hover:underline">
                Vercel dashboard ↗
              </a>{" "}
              — our estimate is usually within ±30%.
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats strip */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Products", s.productCount],
          ["Orders", s.orderCount],
          ["Reviews", s.reviewCount],
          ["Subscribers", s.subscriberCount],
        ].map(([label, n]) => (
          <div key={String(label)} className="card p-4 text-center">
            <div className="font-display text-2xl text-ink">{n}</div>
            <div className="text-xs uppercase tracking-wider text-ink/50">{label}</div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink/50">
        💡 Tip: check this page once a month. When any meter turns red, the fix is usually a
        small upgrade or a migration — ask first; free alternatives often exist.
      </p>

      <Link href="/admin" className="mt-6 inline-block text-sm font-semibold text-clay hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  );
}
