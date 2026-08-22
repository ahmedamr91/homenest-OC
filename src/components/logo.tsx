import Link from "next/link";

// Brand badge: rounded picture-frame with stacked "Empty! Corner!" wordmark,
// in near-black (matches the official logo). Cream variant for dark surfaces.
export function LogoMark({
  width = 44,
  dark = false,
}: {
  width?: number;
  dark?: boolean;
}) {
  const ink = dark ? "#FAF6F0" : "#1A1A1A";
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
        strokeWidth="5.5"
      />
      <g transform="rotate(-1.5 48 34)">
        <text
          x="49"
          y="30"
          textAnchor="middle"
          fontFamily="'Arial Black', 'Segoe UI', Arial, sans-serif"
          fontWeight="900"
          fontSize="19"
          letterSpacing="1"
          fill={ink}
        >
          Empty!
        </text>
        <text
          x="47"
          y="50"
          textAnchor="middle"
          fontFamily="'Arial Black', 'Segoe UI', Arial, sans-serif"
          fontWeight="900"
          fontSize="19"
          letterSpacing="1"
          fill={ink}
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
      <LogoMark width={width} dark={dark} />
      <span
        aria-hidden
        className={`flex flex-col font-black leading-[0.95] tracking-tight ${
          dark ? "text-cream" : "text-[#1A1A1A]"
        } ${compact ? "text-sm" : "text-base"}`}
        style={{ fontFamily: "'Arial Black', 'Segoe UI', Arial, sans-serif" }}
      >
        <span>Empty!</span>
        <span>Corner!</span>
      </span>
    </Link>
  );
}
