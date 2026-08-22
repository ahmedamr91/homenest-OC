import Link from "next/link";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect width="32" height="32" rx="9" fill="#221B15" />
      <path
        d="M7.5 16.5 L16 8 L24.5 16.5"
        stroke="#FAF6F0"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 15v9h10v-9"
        stroke="#FAF6F0"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="19" r="2.6" fill="#B4552D" />
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
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 transition hover:opacity-80"
      aria-label="HOMENEST — home"
    >
      {!compact && <LogoMark />}
      <span
        className={`font-display tracking-wide ${compact ? "text-xl" : "text-2xl"} ${
          dark ? "text-cream" : "text-ink"
        }`}
      >
        HOME<span className="text-clay">NEST</span>
      </span>
    </Link>
  );
}
