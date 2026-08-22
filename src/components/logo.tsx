import Link from "next/link";

// Brand badge: rounded picture-frame with stacked "Empty! Corner!" wordmark,
// drawn in the site palette (ink / cream / clay).
export function LogoMark({
  width = 44,
  dark = false,
}: {
  width?: number;
  dark?: boolean;
}) {
  const ink = dark ? "#FAF6F0" : "#221B15";
  const clay = "#B4552D";
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
        stroke={ink}
        strokeWidth="4.5"
      />
      <g transform="rotate(-1.5 48 34)">
        <text
          x="49"
          y="30"
          textAnchor="middle"
          fontFamily="'Arial Black', 'Segoe UI', Arial, sans-serif"
          fontWeight="900"
          fontSize="17"
          letterSpacing="0.5"
          fill={ink}
        >
          Empty<tspan fill={clay}>!</tspan>
        </text>
        <text
          x="47"
          y="50"
          textAnchor="middle"
          fontFamily="'Arial Black', 'Segoe UI', Arial, sans-serif"
          fontWeight="900"
          fontSize="17"
          letterSpacing="0.5"
          fill={ink}
        >
          Corner<tspan fill={clay}>!</tspan>
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
      <LogoMark width={width} dark={dark} />
      <span
        aria-hidden
        className={`flex flex-col font-black leading-[0.95] tracking-tight ${
          dark ? "text-cream" : "text-ink"
        } ${compact ? "text-sm" : "text-base"}`}
        style={{ fontFamily: "'Arial Black', 'Segoe UI', Arial, sans-serif" }}
      >
        <span>
          Empty<span className="text-clay">!</span>
        </span>
        <span>
          Corner<span className="text-clay">!</span>
        </span>
      </span>
    </Link>
  );
}
