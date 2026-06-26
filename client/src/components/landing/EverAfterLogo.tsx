import { cn } from '@/lib/utils';

interface EverAfterLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const imageSizeClasses = {
  sm: 'h-9 w-auto',
  md: 'h-10 w-auto md:h-11',
  lg: 'h-12 w-auto sm:h-14 md:h-16',
};

const imageDimensions = {
  sm: { width: 120, height: 32 },
  md: { width: 160, height: 40 },
  lg: { width: 280, height: 56 },
};

export function EverAfterLogo({
  className,
  showText = true,
  size = 'md',
}: EverAfterLogoProps) {
  const { width, height } = imageDimensions[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src="/img/logo.svg"
        alt="EverAfter"
        className={cn('object-contain', imageSizeClasses[size])}
        width={width}
        height={height}
        decoding="async"
      />
      {showText && (
        <span className="font-display text-xl font-medium tracking-tight text-on-surface md:text-2xl">
          Ever After
        </span>
      )}
    </div>
  );
}
