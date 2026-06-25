import { cn } from '@/lib/utils';

interface EverAfterLogoProps {
  className?: string;
  showText?: boolean;
}

export function EverAfterLogo({ className, showText = true }: EverAfterLogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src="/img/logo.png"
        alt=""
        className="h-9 w-9 object-contain"
        width={36}
        height={36}
      />
      {showText && (
        <span className="font-display text-xl font-medium tracking-tight text-on-surface">
          Ever After
        </span>
      )}
    </div>
  );
}
