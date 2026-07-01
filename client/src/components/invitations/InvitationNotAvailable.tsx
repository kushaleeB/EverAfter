import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export function InvitationNotAvailable() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf9f6] px-6 py-16">
      <div
        className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-[#f5ebe3] opacity-70 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-12 h-72 w-72 rounded-full bg-[#e8f5e9] opacity-60 blur-3xl"
        aria-hidden
      />

      <div className="relative max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_8px_32px_rgba(78,52,46,0.08)]">
          <Heart className="h-7 w-7 text-[#c5a67c]" strokeWidth={1.5} />
        </div>
        <p className="mt-8 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c5a67c]">
          404
        </p>
        <h1 className="mt-3 font-display text-3xl text-[#4e342e] md:text-4xl">
          Invitation Not Available
        </h1>
        <p className="mt-4 font-body text-base leading-relaxed text-[#6d625a]">
          This invitation may be unpublished, removed, or the link may be incorrect. Please check
          with the hosts for an updated link.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[#4e342e] px-6 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-[#3e2723]"
        >
          Visit EverAfter
        </Link>
      </div>
    </div>
  );
}
