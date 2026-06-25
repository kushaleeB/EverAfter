import { Bell, Search, User } from 'lucide-react';

export function DashboardHeader() {
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
