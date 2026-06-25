import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AUTH_ERROR_MESSAGE = 'Enter the right credentials.';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError(AUTH_ERROR_MESSAGE);
      return;
    }

    // TODO: Restore backend integration — call loginUser(), saveAuthSession(), redirect to /dashboard
    console.log('Authentication integration will be implemented later.');
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
            className="h-12 w-full rounded-xl bg-[#c5a67c] text-white hover:bg-[#b8956a]"
          >
            Sign In
          </Button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#e8dfd6]" />
          <span className="font-body text-xs uppercase tracking-wider text-[#9e8e82]">or</span>
          <div className="h-px flex-1 bg-[#e8dfd6]" />
        </div>

        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#e8dfd6] bg-white font-body text-sm font-medium text-[#1f1b18] transition-colors hover:bg-[#faf7f2]"
        >
          <GoogleIcon />
          Continue with Google
        </button>

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
