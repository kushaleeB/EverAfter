import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DashboardMessageProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
}

export function DashboardMessage({
  title,
  message,
  actionLabel,
  actionTo,
}: DashboardMessageProps) {
  return (
    <div className="rounded-xl border border-[#e8dfd6] bg-white px-6 py-12 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <h2 className="font-display text-xl text-[#4e342e]">{title}</h2>
      <p className="mx-auto mt-3 max-w-md font-body text-sm text-[#6d625a]">{message}</p>
      {actionLabel && actionTo && (
        <Button className="mt-6 bg-[#4e342e] text-white hover:bg-[#3e2723]" asChild>
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
