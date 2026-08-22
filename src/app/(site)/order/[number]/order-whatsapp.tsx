"use client";

export default function OrderWhatsApp({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-7 py-3 text-sm font-bold text-white shadow-card transition hover:brightness-95 hover:shadow-lift"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.2L2 22l4.9-1.6A9.9 9.9 0 1 0 12.04 2Zm5.8 14.2c-.25.7-1.45 1.35-2 1.4-.5.05-1.15.25-3.85-.8-3.25-1.3-5.3-4.6-5.45-4.8-.15-.2-1.3-1.75-1.3-3.35s.85-2.35 1.15-2.65c.3-.3.65-.4.85-.4h.6c.2 0 .45-.05.7.55.25.6.85 2.1.9 2.25.05.15.1.3 0 .5-.1.2-.15.35-.3.55l-.45.5c-.15.15-.3.3-.15.6.15.3.7 1.2 1.5 1.95 1.05.95 1.9 1.25 2.2 1.4.3.15.45.1.65-.05.2-.15.75-.85.95-1.15.2-.3.4-.25.65-.15.25.1 1.65.8 1.95.95.3.15.5.2.55.35.05.1.05.75-.2 1.45Z" />
      </svg>
      Confirm faster on WhatsApp
    </a>
  );
}
