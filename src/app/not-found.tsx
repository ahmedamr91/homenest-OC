import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="font-display text-8xl text-clay/30">404</div>
      <h1 className="mt-4 font-display text-3xl text-ink">
        This page wandered off
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink/60">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </div>
  );
}
