import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { DreamyBackground } from '../DreamyBackground';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { friendlyAuthError } from '../../lib/auth-errors';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';

type AuthMode =
  | 'signin'
  | 'signup'
  | 'forgot'
  | 'magic-link'
  | 'reset'
  | 'sent-verify'
  | 'sent-magic'
  | 'sent-recovery';

interface Feedback {
  message: string;
  hint?: string;
}

export function AuthScreen() {
  const {
    signIn,
    signUp,
    signInWithMagicLink,
    resetPassword,
    updatePassword,
    isPasswordRecovery,
  } = useAuth();
  const { isDarkMode } = useTheme();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);

  // When the user arrives via a recovery link, Supabase emits
  // PASSWORD_RECOVERY on the auth-state subscription. Switch to the reset
  // mode so the user can set a new password.
  useEffect(() => {
    if (isPasswordRecovery) {
      setMode('reset');
      setError(null);
    }
  }, [isPasswordRecovery]);

  const resetFormState = () => {
    setError(null);
    setPassword('');
    setPasswordConfirm('');
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    resetFormState();
  };

  // --- submit handlers ---------------------------------------------------

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) setError(friendlyAuthError(err));
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== passwordConfirm) {
      setError({ message: "Those passwords don't match." });
      return;
    }
    setLoading(true);
    const { error: err } = await signUp(email, password);
    setLoading(false);
    if (err) {
      setError(friendlyAuthError(err));
      return;
    }
    setMode('sent-verify');
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await resetPassword(email);
    setLoading(false);
    if (err) {
      setError(friendlyAuthError(err));
      return;
    }
    setMode('sent-recovery');
  };

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signInWithMagicLink(email);
    setLoading(false);
    if (err) {
      setError(friendlyAuthError(err));
      return;
    }
    setMode('sent-magic');
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== passwordConfirm) {
      setError({ message: "Those passwords don't match." });
      return;
    }
    setLoading(true);
    const { error: err } = await updatePassword(password);
    setLoading(false);
    if (err) {
      setError(friendlyAuthError(err));
      return;
    }
    // Success: AuthContext clears isPasswordRecovery, the App then renders
    // the main UI because the session is still active.
  };

  // --- rendering ---------------------------------------------------------

  const header = (() => {
    switch (mode) {
      case 'signin':
        return { title: 'Welcome back', subtitle: 'Sign in to your journal.' };
      case 'signup':
        return { title: 'Create your journal', subtitle: 'Start holding memories tight.' };
      case 'forgot':
        return {
          title: 'Reset your password',
          subtitle: "Enter your email and we'll send a recovery link.",
        };
      case 'magic-link':
        return {
          title: 'Sign in with a link',
          subtitle: "We'll email you a one-time link — no password needed.",
        };
      case 'reset':
        return { title: 'Choose a new password', subtitle: 'Pick something you can remember.' };
      case 'sent-verify':
        return { title: 'Check your inbox', subtitle: `We sent a verification link to ${email}.` };
      case 'sent-magic':
        return { title: 'Check your inbox', subtitle: `We sent a sign-in link to ${email}.` };
      case 'sent-recovery':
        return { title: 'Check your inbox', subtitle: `We sent a recovery link to ${email}.` };
    }
  })();

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <DreamyBackground isDarkMode={isDarkMode} />
      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Memory Journal</h1>
          <p className="mt-1 text-sm opacity-60">Hold them tight</p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 shadow-xl">
          {/* Back arrow for sub-flows */}
          {(mode === 'forgot' ||
            mode === 'magic-link' ||
            mode === 'sent-verify' ||
            mode === 'sent-magic' ||
            mode === 'sent-recovery') && (
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="mb-4 inline-flex items-center gap-1 text-sm opacity-70 hover:opacity-100"
            >
              <ArrowLeft className="size-3.5" />
              Back to sign in
            </button>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold">{header.title}</h2>
            <p className="mt-1 text-sm opacity-60">{header.subtitle}</p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-700 dark:text-red-300"
            >
              <p className="font-medium">{error.message}</p>
              {error.hint && <p className="mt-1 opacity-80">{error.hint}</p>}
            </div>
          )}

          {/* --- Sign in --------------------------------------------------- */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <EmailField value={email} onChange={setEmail} />
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="password" className="opacity-80">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs opacity-70 hover:opacity-100 underline-offset-2 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => switchMode('magic-link')}
              >
                <Mail className="size-4" />
                Email me a sign-in link
              </Button>
              <p className="pt-2 text-center text-sm opacity-70">
                New here?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-medium underline underline-offset-2 hover:opacity-80"
                >
                  Create an account
                </button>
              </p>
            </form>
          )}

          {/* --- Sign up --------------------------------------------------- */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <EmailField value={email} onChange={setEmail} />
              <div>
                <Label htmlFor="password" className="opacity-80 mb-1 block">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div>
                <Label htmlFor="password-confirm" className="opacity-80 mb-1 block">
                  Confirm password
                </Label>
                <Input
                  id="password-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
              <p className="pt-2 text-center text-sm opacity-70">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="font-medium underline underline-offset-2 hover:opacity-80"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* --- Forgot password ------------------------------------------ */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <EmailField value={email} onChange={setEmail} />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Sending…' : 'Send recovery link'}
              </Button>
            </form>
          )}

          {/* --- Magic link ----------------------------------------------- */}
          {mode === 'magic-link' && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <EmailField value={email} onChange={setEmail} />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Sending…' : 'Email me a sign-in link'}
              </Button>
            </form>
          )}

          {/* --- Reset password ------------------------------------------- */}
          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <Label htmlFor="new-password" className="opacity-80 mb-1 block">
                  New password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div>
                <Label htmlFor="new-password-confirm" className="opacity-80 mb-1 block">
                  Confirm new password
                </Label>
                <Input
                  id="new-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          )}

          {/* --- "Check your inbox" states -------------------------------- */}
          {(mode === 'sent-verify' || mode === 'sent-magic' || mode === 'sent-recovery') && (
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-green-700 dark:text-green-300">
                <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Link sent.</p>
                  <p className="opacity-80">
                    Click the link in the email to{' '}
                    {mode === 'sent-verify'
                      ? 'confirm your account'
                      : mode === 'sent-magic'
                        ? 'sign in'
                        : 'choose a new password'}
                    .
                  </p>
                </div>
              </div>
              <p className="text-xs opacity-60">
                Nothing arriving? Check your spam folder, or{' '}
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'sent-magic' ? 'magic-link' : 'forgot')}
                  className="underline underline-offset-2"
                >
                  try again
                </button>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Shared email input — same field appears in most modes.
function EmailField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor="email" className="opacity-80 mb-1 block">
        Email
      </Label>
      <Input
        id="email"
        type="email"
        autoComplete="email"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="you@example.com"
      />
    </div>
  );
}
