import Link from "next/link";

// Official brand asset, processed from the designer's original file:
// black artwork for light surfaces, cream artwork for dark surfaces.
export default function Logo({
  dark = false,
  compact = false,
  height,
  yellow = false,
}: {
  dark?: boolean;
  compact?: boolean;
  height?: number;
  yellow?: boolean;
}) {
  const finalHeight = height ?? (compact ? 30 : 40);
  const src = yellow
    ? "/brand-logo-yellow.png"
    : dark
      ? "/brand-logo-cream.png"
      : "/brand-logo.png";
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center transition hover:opacity-85"
      aria-label="Empty Corner — home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Empty Corner" className="w-auto" style={{ height: finalHeight }} />
    </Link>
  );
}
