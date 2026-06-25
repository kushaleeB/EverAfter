import { Star } from 'lucide-react';

const pressLogos = ['Brides', 'Vogue', 'The Knot'];

export function LandingTrustBar() {
  return (
    <div className="relative z-10 mt-auto w-full border-t border-outline-variant/25 bg-[#fcf8f5]">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-6 py-5 md:flex-row md:px-16 md:py-6">
        {/* Social proof */}
        <div className="flex items-center gap-4">
          <div className="flex items-center" aria-hidden>
            <div className="z-0 h-9 w-9 shrink-0 rounded-full border-2 border-[#fcf8f5] bg-[#c9a87c] md:h-10 md:w-10" />
            <div className="-ml-2.5 z-[1] h-9 w-9 shrink-0 rounded-full border-2 border-[#fcf8f5] bg-[#1f1b18] md:-ml-3 md:h-10 md:w-10" />
            <div className="-ml-2.5 z-[2] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#fcf8f5] bg-[#e8dfd6] font-body text-[11px] font-medium text-on-surface-variant md:-ml-3 md:h-10 md:w-10 md:text-xs">
              +2k
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-2xl leading-none text-on-surface md:text-[1.75rem]">
                4.9
              </span>
              <Star
                className="h-4 w-4 fill-[#c9a87c] text-[#c9a87c]"
                strokeWidth={0}
                aria-hidden
              />
            </div>
            <p className="mt-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
              Loved by couples
            </p>
          </div>
        </div>

        {/* Press / partner names */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {pressLogos.map((name) => (
            <span
              key={name}
              className="font-display text-lg italic text-[#6d625a] md:text-xl"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
