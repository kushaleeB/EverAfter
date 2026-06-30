import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, LogOut, Shield, User } from 'lucide-react';
import { changePassword, logoutAllSessions, logoutUser } from '@/api/auth';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { DashboardMessage } from '@/components/dashboard/DashboardMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api';
import { getRefreshToken } from '@/lib/auth';
import { formatDate } from '@/lib/guests';
import { useAuthStore } from '@/stores/authStore';

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#f0ebe6] bg-[#faf9f6] px-4 py-3">
      <p className="font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9e8e82]">
        {label}
      </p>
      <p className="mt-1 font-body text-sm text-[#4e342e]">{value}</p>
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      await refreshUser();
      setLoading(false);
    })();
  }, [refreshUser]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage(result.message ?? 'Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    setLoggingOutAll(true);
    try {
      await logoutAllSessions();
      clearSession();
      navigate('/login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to sign out all sessions.');
      setLoggingOutAll(false);
    }
  };

  const handleSignOut = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await logoutUser(refreshToken);
      } catch {
        // Ignore API failures during local sign-out.
      }
    }
    clearSession();
    navigate('/login');
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="font-display text-3xl text-[#4e342e] md:text-4xl">Settings</h1>
        <p className="mt-2 font-body text-sm text-[#6d625a]">
          Manage your account and security preferences.
        </p>
      </div>

      {loading && (
        <p className="mt-8 font-body text-sm text-[#6d625a]">Loading account settings...</p>
      )}

      {error && !loading && (
        <div className="mt-6">
          <DashboardMessage
            title="Account unavailable"
            message={error}
            actionLabel="Sign In"
            actionTo="/login"
          />
        </div>
      )}

      {user && !loading && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-[#e8dfd6] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#705639]" />
              <h2 className="font-display text-xl text-[#4e342e]">Profile</h2>
            </div>
            <p className="mt-2 font-body text-sm text-[#6d625a]">
              Loaded from <code className="text-xs">GET /auth/me</code>. Profile editing is not yet
              available on the backend.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ProfileField label="First Name" value={user.firstName} />
              <ProfileField label="Last Name" value={user.lastName} />
              <ProfileField label="Email" value={user.email} />
              <ProfileField label="Role" value={user.role} />
              <ProfileField label="Member Since" value={formatDate(user.createdAt)} />
              <ProfileField
                label="Email Verified"
                value={user.emailVerifiedAt ? formatDate(user.emailVerifiedAt) : 'Not verified'}
              />
            </div>
          </section>

          <section className="rounded-xl border border-[#e8dfd6] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[#705639]" />
              <h2 className="font-display text-xl text-[#4e342e]">Change Password</h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block font-body text-xs font-medium text-[#6d625a]">
                  Current password
                </label>
                <Input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block font-body text-xs font-medium text-[#6d625a]">
                  New password
                </label>
                <Input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block font-body text-xs font-medium text-[#6d625a]">
                  Confirm new password
                </label>
                <Input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
                  }
                />
              </div>
              <p className="font-body text-xs text-[#9e8e82]">
                Must be 8+ characters with uppercase, lowercase, and a number.
              </p>
              {passwordError && (
                <p className="font-body text-sm text-red-700">{passwordError}</p>
              )}
              {passwordMessage && (
                <p className="font-body text-sm text-[#2e7d32]">{passwordMessage}</p>
              )}
              <Button
                type="submit"
                disabled={savingPassword}
                className="bg-[#4e342e] text-white hover:bg-[#3e2723]"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </section>

          <section className="rounded-xl border border-[#e8dfd6] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] lg:col-span-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#705639]" />
              <h2 className="font-display text-xl text-[#4e342e]">Security</h2>
            </div>
            <p className="mt-2 font-body text-sm text-[#6d625a]">
              Sign out on this device or revoke all active sessions across devices.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="ghost"
                className="border border-[#e8dfd6] text-[#4e342e] hover:bg-[#faf7f2]"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="border border-[#e8dfd6] text-[#4e342e] hover:bg-[#faf7f2]"
                disabled={loggingOutAll}
                onClick={() => void handleLogoutAll()}
              >
                {loggingOutAll ? 'Signing out...' : 'Sign Out All Devices'}
              </Button>
              <Button variant="ghost" className="text-[#6d625a]" asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}
