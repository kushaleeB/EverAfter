import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type ActiveProduct = 'features' | 'templates' | 'pricing';
type ActiveCompany = 'stories' | 'about' | 'press';

interface MarketingFooterProps {
  activeProduct?: ActiveProduct;
  activeCompany?: ActiveCompany;
}

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/features', key: 'features' as const },
      { label: 'Templates', to: '/templates', key: 'templates' as const },
      { label: 'Pricing', to: '/pricing', key: 'pricing' as const },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Stories', to: '/stories', key: 'stories' as const },
      { label: 'About', to: '/about', key: 'about' as const },
      { label: 'Press', href: '#press', key: 'press' as const },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#privacy' },
      { label: 'Terms', href: '#terms' },
      { label: 'Cookie Policy', href: '#cookies' },
    ],
  },
];

export function MarketingFooter({ activeProduct, activeCompany }: MarketingFooterProps) {
  return (
    <footer className="border-t border-[#e8dfd6] bg-[#fdf5f0] px-6 py-16 md:px-16">
      <div className="mx-auto grid max-w-[1280px] gap-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link to="/" className="font-display text-2xl text-[#4e342e]">
            EverAfter
          </Link>
          <p className="mt-6 font-body text-xs text-[#9e8e82] md:mt-8">
            &copy; {new Date().getFullYear()} EverAfter luxury wedding experiences. All rights
            reserved.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="font-body text-xs font-semibold uppercase tracking-[0.05em] text-[#4e342e]">
              {column.title}
            </h3>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  {'to' in link ? (
                    <Link
                      to={link.to}
                      className={cn(
                        'font-body text-sm text-[#6d625a] transition-colors hover:text-[#4e342e]',
                        activeProduct && 'key' in link && link.key === activeProduct && 'font-semibold text-[#4e342e]',
                        activeCompany && 'key' in link && link.key === activeCompany && 'font-semibold text-[#4e342e]',
                      )}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className={cn(
                        'font-body text-sm text-[#6d625a] transition-colors hover:text-[#4e342e]',
                        activeCompany && 'key' in link && link.key === activeCompany && 'font-semibold text-[#4e342e]',
                      )}
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
