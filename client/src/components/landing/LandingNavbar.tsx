import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const centerLinks: Array<
  | { label: string; to: string; end?: boolean }
  | { label: string; href: string }
> = [
  { label: 'Features', to: '/features', end: true },
  { label: 'Templates', to: '/templates', end: true },
  { label: 'Pricing', to: '/pricing', end: true },
  { label: 'Stories', to: '/stories', end: true },
  { label: 'About', to: '/about', end: true },
];

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#faf9f6]">
      <div className="relative mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6 md:px-16">
        <Link to="/" className="relative z-10 flex shrink-0 items-center">
          <img
            src="/img/logo.png"
            alt="Ever After"
            className="h-10 w-auto object-contain md:h-11"
            width={120}
            height={44}
          />
        </Link>

        <nav
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 lg:flex"
          aria-label="Main navigation"
        >
          {centerLinks.map((link) =>
            'to' in link ? (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'font-body text-[15px] font-normal transition-colors',
                    isActive
                      ? 'text-[#4e342e] underline decoration-[#4e342e] underline-offset-4'
                      : 'text-[#555555] hover:text-[#4e342e]',
                  )
                }
              >
                {link.label}
              </NavLink>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="font-body text-[15px] font-normal text-[#555555] transition-colors hover:text-[#4e342e]"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="relative z-10 flex items-center gap-6">
          <Link
            to="/login"
            className="font-body text-[15px] font-normal text-[#555555] transition-colors hover:text-[#4e342e]"
          >
            Sign In
          </Link>
          <Button
            variant="primary"
            size="sm"
            className="bg-[#4e342e] px-6 hover:bg-[#3e2723]"
            asChild
          >
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
