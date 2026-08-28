"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { HeroSlide } from "@/lib/settings";

export default function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (i: number) => setIndex((i + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, slides.length]);

  return (
    <section
      className="relative aspect-[16/9] h-auto w-full overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {slides.map((s, i) => {
        const light = s.theme === "light";
        return (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.imageUrl}
              alt={s.headline || "Promotion"}
              className="h-full w-full object-cover"
            />
            {!light && (
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            )}

            <div
              className={`absolute inset-0 flex flex-col items-center justify-center px-6 pb-20 text-center ${
                light ? "text-ink" : "text-white"
              }`}
            >
              {s.headline && (
                <h2
                  className={`font-display text-4xl leading-tight drop-shadow-md sm:text-6xl ${
                    light ? "" : "drop-shadow-md"
                  }`}
                >
                  {s.headline}
                </h2>
              )}
              {s.subtext && (
                <p
                  className={`mt-3 max-w-xl text-sm sm:text-lg ${
                    light ? "text-ink/70" : "text-white/90"
                  }`}
                >
                  {s.subtext}
                </p>
              )}
            </div>

            <div className="absolute bottom-12 left-0 right-0 flex justify-center">
              <Link
                href={s.href}
                tabIndex={i === index ? 0 : -1}
                className="btn-primary shadow-lift"
              >
                {s.buttonText}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
            </div>
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          {(() => {
            const light = slides[index]?.theme === "light";
            const arrowCls = light
              ? "bg-ink/10 text-ink hover:bg-ink/20"
              : "bg-white/25 text-white hover:bg-white/40";
            const dot = (active: boolean) =>
              `h-2 rounded-full transition-all ${
                active
                  ? light
                    ? "w-6 bg-ink"
                    : "w-6 bg-white"
                  : light
                    ? "w-2 bg-ink/30 hover:bg-ink/50"
                    : "w-2 bg-white/50 hover:bg-white/80"
              }`;
            return (
              <>
                <button
                  onClick={() => go(index - 1)}
                  aria-label="Previous slide"
                  className={`absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur transition ${arrowCls}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button
                  onClick={() => go(index + 1)}
                  aria-label="Next slide"
                  className={`absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur transition ${arrowCls}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                </button>

                <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => go(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={dot(i === index)}
                    />
                  ))}
                </div>
              </>
            );
          })()}
        </>
      )}
    </section>
  );
}
