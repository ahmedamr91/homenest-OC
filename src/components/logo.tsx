import Link from "next/link";

// Official brand asset, processed from the designer's original file:
// black artwork for light surfaces, cream artwork for dark surfaces.
export default function Logo({
  dark = false,
  compact = false,
}: {
  dark?: boolean;
  compact?: boolean;
}) {
  const height = compact ? 30 : 40;
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center transition hover:opacity-85"
      aria-label="Empty Corner — home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dark ? "/brand-logo-cream.png" : "/brand-logo.png"}
        alt="Empty Corner"
        className="w-auto"
        style={{ height }}
      />
    </Link>
  );
}
