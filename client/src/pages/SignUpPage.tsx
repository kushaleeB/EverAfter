import { useState } from 'react';
import { MoveRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '@/api/auth';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { RegisterFeatureHighlights } from '@/components/auth/RegisterFeatureHighlights';
import {
  isPasswordValid,
  PasswordRequirements,
} from '@/components/auth/PasswordRequirements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  authFieldErrorsToMessage,
  mapAuthError,
  type AuthFieldErrors,
} from '@/lib/authErrors';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const AUTH_ERROR_MESSAGE = 'Enter the right credentials.';

export function SignUpPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !isPasswordValid(password) ||
      !agreed
    ) {
      setError(AUTH_ERROR_MESSAGE);
      return;
    }

    try {
      setIsLoading(true);
      const session = await registerUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      setSession(session);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const mapped = mapAuthError(err);
      setFieldErrors(mapped);
      setError(mapped.general ?? '');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthSplitLayout variant="signup" footer={<RegisterFeatureHighlights />}>
      <div className="rounded-2xl bg-white px-6 py-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] md:px-8 md:py-10">
        <div className="text-center">
          <h1 className="font-display text-3xl text-[#1f1b18] md:text-4xl">Create Your Account</h1>
          <p className="mt-3 font-body text-sm text-[#6d625a] md:text-base">
            Start designing your dream wedding experience.
          </p>
        </div>

        {error && (
          <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 font-body text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="font-body text-xs font-medium text-[#4e342e]"
              >
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                className={cn('mt-1.5', fieldErrors.firstName && 'border-red-300')}
              />
              {fieldErrors.firstName && (
                <p className="mt-1 font-body text-xs text-red-600">{fieldErrors.firstName}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="font-body text-xs font-medium text-[#4e342e]"
              >
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                className={cn('mt-1.5', fieldErrors.lastName && 'border-red-300')}
              />
              {fieldErrors.lastName && (
                <p className="mt-1 font-body text-xs text-red-600">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="font-body text-xs font-medium text-[#4e342e]">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={cn('mt-1.5', fieldErrors.email && 'border-red-300')}
            />
            {fieldErrors.email && (
              <p className="mt-1 font-body text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="font-body text-xs font-medium text-[#4e342e]">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className={cn('mt-1.5', fieldErrors.password && 'border-red-300')}
            />
            {fieldErrors.password && (
              <p className="mt-1 font-body text-xs text-red-600">{fieldErrors.password}</p>
            )}
            <PasswordRequirements password={password} />
          </div>

          <label className="flex cursor-pointer items-start gap-3 pt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[#d9cfc6] text-[#c5a67c] focus:ring-[#c5a67c]"
            />
            <span className="font-body text-sm leading-relaxed text-[#6d625a]">
              I agree to the{' '}
              <a href="#terms" className="text-[#4e342e] underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-[#4e342e] underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-[#c5a67c] text-white hover:bg-[#b8956a]"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
            {!isLoading && <MoveRight className="h-4 w-4" />}
          </Button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#e8dfd6]" />
          <span className="font-body text-xs uppercase tracking-wider text-[#9e8e82]">or</span>
          <div className="h-px flex-1 bg-[#e8dfd6]" />
        </div>

        <GoogleSignInButton
          disabled={isLoading}
          onError={setError}
          beforeLogin={() => {
            if (!agreed) {
              setError('Please agree to the Terms of Service and Privacy Policy.');
              return false;
            }
            return true;
          }}
        />

        <p className="mt-8 text-center font-body text-sm text-[#6d625a]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#4e342e] underline">
            Sign In
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
