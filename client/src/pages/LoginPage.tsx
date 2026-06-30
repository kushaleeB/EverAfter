import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, logoutUser } from '@/api/auth';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authFieldErrorsToMessage, mapAuthError } from '@/lib/authErrors';
import { getRefreshToken } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { formatDisplayName } from '@/lib/dates';

const AUTH_ERROR_MESSAGE = 'Enter the right credentials.';
const DEMO_EMAIL = 'demo@everafter.app';
const DEMO_PASSWORD = 'Demo1234!';

export function LoginPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setError('');
    setIsSigningOut(true);

    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch {
      // Clear local session even if the API call fails.
    } finally {
      clearSession();
      setIsSigningOut(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError(AUTH_ERROR_MESSAGE);
      return;
    }

    try {
      setIsLoading(true);
      const session = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });
      setSession(session);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(authFieldErrorsToMessage(mapAuthError(err)));
    } finally {
      setIsLoading(false);
    }
  }

  function fillDemoCredentials() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
  }

  return (
    <AuthSplitLayout variant="login">
      <div className="rounded-2xl bg-white px-6 py-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] md:px-8 md:py-10">
        <Link to="/" className="font-display text-2xl text-[#c5a67c]">
          EverAfter
        </Link>

        <h1 className="mt-6 font-display text-3xl text-[#1f1b18]">Welcome Back</h1>
        <p className="mt-2 font-body text-sm text-[#6d625a]">
          Sign in to continue planning your special day.
        </p>

        {isAuthenticated && user && (
          <div className="mt-5 rounded-lg border border-[#e8dfd6] bg-[#faf7f2] px-4 py-3">
            <p className="font-body text-sm text-[#4e342e]">
              Signed in as{' '}
              <span className="font-medium">
                {formatDisplayName(user.firstName, user.lastName)}
              </span>{' '}
              ({user.email}).
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Button
                type="button"
                className="h-9 rounded-lg bg-[#c5a67c] px-4 text-white hover:bg-[#b8956a]"
                onClick={() => navigate('/dashboard', { replace: true })}
              >
                Go to Dashboard
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={isSigningOut}
                className="h-9 rounded-lg border border-[#e8dfd6] px-4 text-[#4e342e]"
                onClick={() => void handleSignOut()}
              >
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        )}

        {import.meta.env.DEV && (
          <div className="mt-5 rounded-lg border border-dashed border-[#d9cfc6] bg-[#fffaf7] px-4 py-3">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-[#9e8e82]">
              Demo account
            </p>
            <p className="mt-2 font-body text-sm text-[#6d625a]">
              {DEMO_EMAIL} / {DEMO_PASSWORD}
            </p>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="mt-2 font-body text-sm font-medium text-[#c5a67c] hover:underline"
            >
              Use demo credentials
            </button>
          </div>
        )}

        {error && (
          <p
            className="mt-5 rounded-lg bg-red-50 px-4 py-3 font-body text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9e8e82]"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              variant="underline"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-2"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9e8e82]"
            >
              Password
            </label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                variant="underline"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#9e8e82] hover:text-[#4e342e]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[#d9cfc6] text-[#c5a67c] focus:ring-[#c5a67c]"
              />
              <span className="font-body text-sm text-[#6d625a]">Remember Me</span>
            </label>
            <a href="#forgot-password" className="font-body text-sm text-[#c5a67c] hover:underline">
              Forgot Password?
            </a>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-[#c5a67c] text-white hover:bg-[#b8956a]"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#e8dfd6]" />
          <span className="font-body text-xs uppercase tracking-wider text-[#9e8e82]">or</span>
          <div className="h-px flex-1 bg-[#e8dfd6]" />
        </div>

        <GoogleSignInButton disabled={isLoading} onError={setError} />

        <p className="mt-8 text-center font-body text-sm text-[#6d625a]">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-[#c5a67c] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
