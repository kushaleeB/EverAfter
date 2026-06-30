import { useEffect, useRef, useState } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '@/api/auth';
import { getRefreshToken } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  variant?: 'default' | 'search';
}

export function DashboardHeader({ variant = 'default' }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const [searchOpen, setSearchOpen] = useState(variant === 'search');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function focusSearch() {
    setSearchOpen(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/dashboard/guests?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setSearchQuery('');
  }

  async function handleSignOut() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await logoutUser(refreshToken);
      } catch {
        // Clear local session even if the API call fails.
      }
    }
    clearSession();
    setProfileOpen(false);
    navigate('/login', { replace: true });
  }

  const profileName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Profile';

  const searchField = (
    <form
      onSubmit={handleSearchSubmit}
      className={cn(
        'relative transition-all duration-200',
        variant === 'search' ? 'w-full max-w-md' : searchOpen ? 'w-64' : 'w-0 overflow-hidden opacity-0',
        variant === 'default' && searchOpen && 'w-64 opacity-100',
      )}
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e8e82]"
        aria-hidden
      />
      <input
        ref={searchInputRef}
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search guests..."
        className="h-10 w-full rounded-lg border border-[#e8dfd6] bg-[#faf9f6] py-2 pl-10 pr-4 font-body text-sm text-[#4e342e] outline-none transition-colors placeholder:text-[#9e8e82] focus:border-[#c5a67c] focus:bg-white"
      />
    </form>
  );

  const actionButtons = (
    <>
      <button
        type="button"
        onClick={focusSearch}
        className="rounded-lg p-2 text-[#6d625a] transition-colors hover:bg-[#faf7f2] hover:text-[#4e342e]"
        aria-label="Search"
      >
        <Search className="h-5 w-5" strokeWidth={1.5} />
      </button>

      <div className="relative" ref={notificationsRef}>
        <button
          type="button"
          onClick={() => {
            setNotificationsOpen((open) => !open);
            setProfileOpen(false);
          }}
          className="relative rounded-lg p-2 text-[#6d625a] transition-colors hover:bg-[#faf7f2] hover:text-[#4e342e]"
          aria-label="Notifications"
          aria-expanded={notificationsOpen}
        >
          <Bell className="h-5 w-5" strokeWidth={1.5} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {notificationsOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-[#e8dfd6] bg-white py-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <p className="px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.1em] text-[#9e8e82]">
              Notifications
            </p>
            <p className="px-4 py-6 text-center font-body text-sm text-[#6d625a]">
              You&apos;re all caught up. New RSVP updates will appear here.
            </p>
          </div>
        )}
      </div>

      <div className="relative" ref={profileRef}>
        <button
          type="button"
          onClick={() => {
            setProfileOpen((open) => !open);
            setNotificationsOpen(false);
          }}
          className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-3 text-[#4e342e] transition-colors hover:bg-[#faf7f2]"
          aria-label="Profile menu"
          aria-expanded={profileOpen}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5ebe3]">
            <User className="h-4 w-4 text-[#705639]" strokeWidth={1.5} />
          </span>
          <span className={cn('font-body text-sm font-medium', variant === 'search' && 'hidden sm:inline')}>
            Profile
          </span>
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[#e8dfd6] bg-white py-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="border-b border-[#f0ebe6] px-4 py-3">
              <p className="font-body text-sm font-medium text-[#4e342e]">{profileName}</p>
              {user?.email && (
                <p className="mt-0.5 truncate font-body text-xs text-[#9e8e82]">{user.email}</p>
              )}
            </div>
            <Link
              to="/dashboard/settings"
              onClick={() => setProfileOpen(false)}
              className="block px-4 py-2.5 font-body text-sm text-[#4e342e] hover:bg-[#faf7f2]"
            >
              Account Settings
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="block w-full px-4 py-2.5 text-left font-body text-sm text-[#c45c5c] hover:bg-[#faf7f2]"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );

  if (variant === 'search') {
    return (
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-[#e8dfd6] bg-white px-6 lg:px-8">
        <div className="flex flex-1 justify-center">{searchField}</div>
        <div className="flex shrink-0 items-center gap-2">{actionButtons}</div>
      </header>
    );
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-3 border-b border-[#e8dfd6] bg-white px-6 lg:px-8">
      {searchField}
      {actionButtons}
    </header>
  );
}
