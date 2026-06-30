import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  CheckSquare,
  HelpCircle,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Plus,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/api/auth';
import { getRefreshToken } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';

const mainNav = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Events', to: '/dashboard/events', icon: Calendar, end: true },
  { label: 'Overview', to: '/dashboard/overview', icon: BarChart3, end: true },
  { label: 'Invitations', to: '/dashboard/invitations', icon: Mail, end: true },
  { label: 'Guests', to: '/dashboard/guests', icon: Users },
  { label: 'RSVPs', to: '/dashboard/rsvps', icon: CheckSquare },
  { label: 'Media', to: '/dashboard/media', icon: Image, end: true },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings },
];

export function DashboardSidebar() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);

  async function handleLogout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await logoutUser(refreshToken);
      } catch {
        // Clear local session even if the API call fails.
      }
    }
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-[#e8dfd6] bg-white px-4 py-6">
      <Link to="/dashboard" className="px-3">
        <span className="font-display text-xl text-[#4e342e]">EverAfter</span>
        <p className="mt-0.5 font-body text-[11px] text-[#9e8e82]">Wedding Planning</p>
      </Link>

      <Button
        className="mx-3 mt-6 h-10 w-[calc(100%-1.5rem)] rounded-lg bg-[#4e342e] text-white hover:bg-[#3e2723]"
        size="sm"
        asChild
      >
        <Link to="/dashboard/events/new">
          <Plus className="h-4 w-4" />
          New Event
        </Link>
      </Button>

      <nav className="mt-6 flex-1 space-y-0.5" aria-label="Dashboard navigation">
        {mainNav.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm transition-colors',
                isActive
                  ? 'bg-[#faf7f2] font-medium text-[#4e342e]'
                  : 'text-[#6d625a] hover:bg-[#faf9f6] hover:text-[#4e342e]',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 border-t border-[#e8dfd6] pt-4">
        <a
          href="#help"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm text-[#6d625a] transition-colors hover:bg-[#faf9f6] hover:text-[#4e342e]"
        >
          <HelpCircle className="h-4 w-4" strokeWidth={1.5} />
          Help
        </a>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm text-[#6d625a] transition-colors hover:bg-[#faf9f6] hover:text-[#4e342e]"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </aside>
  );
}
