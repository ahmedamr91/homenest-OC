import Link from "next/link";
import { brandFont } from "@/app/fonts";

const BRAND_ORANGE = "#F97316";

// Brand badge: rounded picture-frame with stacked "Empty! Corner!" wordmark,
// in brand orange with the chunky Titan One lettering (matches the uploaded logo style).
// Orange reads well on both cream (storefront) and dark (admin) backgrounds.
export function LogoMark({
  width = 44,
  dark = false,
}: {
  width?: number;
  dark?: boolean;
}) {
  const height = Math.round(width * 0.72);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 96 69"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect
        x="4"
        y="4"
        width="88"
        height="61"
        rx="11"
        fill="none"
        stroke={BRAND_ORANGE}
        strokeWidth="5.5"
      />
      <g transform="rotate(-1.5 48 34)">
        <text
          x="49"
          y="30"
          textAnchor="middle"
          fontFamily={brandFont.style.fontFamily}
          fontSize="19"
          letterSpacing="1"
          fill={BRAND_ORANGE}
        >
          Empty!
        </text>
        <text
          x="47"
          y="50"
          textAnchor="middle"
          fontFamily={brandFont.style.fontFamily}
          fontSize="19"
          letterSpacing="1"
          fill={BRAND_ORANGE}
        >
          Corner!
        </text>
      </g>
    </svg>
  );
}

export default function Logo({
  dark = false,
  compact = false,
}: {
  dark?: boolean;
  compact?: boolean;
}) {
  const width = compact ? 38 : 46;
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 transition hover:opacity-85"
      aria-label="Empty Corner — home"
    >
      <LogoMark width={width} />
      <span
        aria-hidden
        className={`flex flex-col leading-[0.95] tracking-tight ${compact ? "text-sm" : "text-base"}`}
        style={{ fontFamily: brandFont.style.fontFamily, color: BRAND_ORANGE }}
      >
        <span>Empty!</span>
        <span>Corner!</span>
      </span>
    </Link>
  );
}
