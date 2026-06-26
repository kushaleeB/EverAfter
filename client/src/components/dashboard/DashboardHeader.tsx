import { Bell, Search, User } from 'lucide-react';

interface DashboardHeaderProps {
  variant?: 'default' | 'search';
}

export function DashboardHeader({ variant = 'default' }: DashboardHeaderProps) {
  if (variant === 'search') {
    return (
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-[#e8dfd6] bg-white px-6 lg:px-8">
        <div className="flex flex-1 justify-center">
          <div className="relative w-full max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e8e82]"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search..."
              className="h-10 w-full rounded-lg border border-[#e8dfd6] bg-[#faf9f6] py-2 pl-10 pr-4 font-body text-sm text-[#4e342e] outline-none transition-colors placeholder:text-[#9e8e82] focus:border-[#c5a67c] focus:bg-white"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="rounded-lg p-2 text-[#6d625a] transition-colors hover:bg-[#faf7f2] hover:text-[#4e342e]"
            aria-label="Search"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="relative rounded-lg p-2 text-[#6d625a] transition-colors hover:bg-[#faf7f2] hover:text-[#4e342e]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" strokeWidth={1.5} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-3 text-[#4e342e] transition-colors hover:bg-[#faf7f2]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5ebe3]">
              <User className="h-4 w-4 text-[#705639]" strokeWidth={1.5} />
            </span>
            <span className="hidden font-body text-sm font-medium sm:inline">Profile</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-4 border-b border-[#e8dfd6] bg-white px-6 lg:px-8">
      <button
        type="button"
        className="rounded-lg p-2 text-[#6d625a] transition-colors hover:bg-[#faf7f2] hover:text-[#4e342e]"
        aria-label="Search"
      >
        <Search className="h-5 w-5" strokeWidth={1.5} />
      </button>
      <button
        type="button"
        className="relative rounded-lg p-2 text-[#6d625a] transition-colors hover:bg-[#faf7f2] hover:text-[#4e342e]"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
      </button>
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-3 text-[#4e342e] transition-colors hover:bg-[#faf7f2]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5ebe3]">
          <User className="h-4 w-4 text-[#705639]" strokeWidth={1.5} />
        </span>
        <span className="font-body text-sm font-medium">Profile</span>
      </button>
    </header>
  );
}
