import { Link } from 'react-router-dom';
import { EverAfterLogo } from '@/components/landing/EverAfterLogo';

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'Templates', to: '/templates' },
      { label: 'Pricing', to: '/pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Stories', href: '#about' },
      { label: 'About', href: '#contact' },
      { label: 'Press', href: '#blog' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms', href: '#terms' },
      { label: 'Privacy', href: '#privacy' },
      { label: 'Cookie Policy', href: '#cookies' },
    ],
  },
];

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="about"
      className="border-t border-outline-variant/30 bg-surface-container-high px-6 py-16 md:px-16"
    >
      <div className="mx-auto grid max-w-[1280px] gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <EverAfterLogo showText={false} size="md" />
          <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-on-surface-variant">
            Crafting digital experiences as beautiful and timeless as your love story.
          </p>
          <p className="mt-6 font-body text-xs text-on-surface-variant/80">
            &copy; {year} EverAfter luxury wedding experiences. All rights reserved.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="font-body text-xs font-semibold uppercase tracking-[0.05em] text-on-surface">
              {column.title}
            </h3>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  {'to' in link ? (
                    <Link
                      to={link.to}
                      className="font-body text-sm text-on-surface-variant transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="font-body text-sm text-on-surface-variant transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
