import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const SIGNUP_HERO_IMAGE = '/img/signUp/Container.png';
const LOGIN_HERO_IMAGE = '/img/login/login_img.png';

interface AuthSplitLayoutProps {
  variant: 'login' | 'signup';
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthSplitLayout({ variant, children, footer }: AuthSplitLayoutProps) {
  const heroImage = variant === 'signup' ? SIGNUP_HERO_IMAGE : LOGIN_HERO_IMAGE;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left — hero image */}
      <div className="relative min-h-[280px] flex-1 lg:min-h-screen lg:max-w-[50%]">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/30 lg:bg-gradient-to-r lg:from-black/40 lg:via-black/20 lg:to-transparent" />

        {variant === 'signup' ? (
          <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-12 lg:p-14">
            <div>
              <Link to="/" className="font-display text-2xl text-white md:text-3xl">
                EverAfter
              </Link>
              <h1 className="mt-8 max-w-md font-display text-3xl leading-tight text-white md:text-4xl lg:text-[2.75rem]">
                Begin your forever story.
              </h1>
              <p className="mt-4 max-w-md font-body text-sm leading-relaxed text-white/85 md:text-base">
                Design stunning wedding invitations, manage guests, and celebrate every moment
                effortlessly.
              </p>
            </div>
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">
              Quiet Luxury Awaits
            </p>
          </div>
        ) : (
          <div className="relative z-10 flex h-full items-end p-8 md:p-12 lg:p-14">
            <div className="max-w-md">
              <h1 className="font-display text-3xl leading-tight text-white md:text-4xl">
                Every love story deserves a beautiful beginning.
              </h1>
              <p className="mt-4 font-body text-sm leading-relaxed text-white/85 md:text-base">
                Create elegant digital invitations and celebrate every moment beautifully.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right — form area */}
      <div className="flex flex-1 flex-col bg-[#fff9f5] px-6 py-10 md:px-12 lg:max-w-[50%] lg:px-16 lg:py-12">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          {children}
        </div>
        {footer && <div className="mx-auto mt-10 w-full max-w-md">{footer}</div>}
      </div>
    </div>
  );
}
