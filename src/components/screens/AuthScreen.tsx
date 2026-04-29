import { useEffect, useState, type FormEvent } from 'react';
import { useAuth, type OAuthProvider } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { DreamyBackground } from '../DreamyBackground';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { friendlyAuthError } from '../../lib/auth-errors';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { BrandMark } from '../BrandMark';

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

interface AuthScreenProps {
  initialMode?: Extract<AuthMode, 'signin' | 'signup'>;
  onBackToLanding?: () => void;
}

export function AuthScreen({ initialMode = 'signin', onBackToLanding }: AuthScreenProps) {
  const {
    signIn,
    signUp,
    signInWithMagicLink,
    signInWithOAuth,
    resetPassword,
    updatePassword,
    isPasswordRecovery,
  } = useAuth();
  const { isDarkMode } = useTheme();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

  // When the user arrives via a recovery link, Supabase emits
  // PASSWORD_RECOVERY on the auth-state subscription. Switch to the reset
  // mode so the user can set a new password.
  useEffect(() => {
    if (isPasswordRecovery) {
      setMode('reset');
      setError(null);
      return;
    }
    setMode(initialMode);
    setError(null);
  }, [initialMode, isPasswordRecovery]);

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

  const handleOAuth = async (provider: OAuthProvider) => {
    setError(null);
    setOauthLoading(provider);
    const { error: err } = await signInWithOAuth(provider);
    if (err) {
      setOauthLoading(null);
      setError(friendlyAuthError(err));
    }
    // On success, the browser is redirected to the provider. No cleanup needed.
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
          <BrandMark size="lg" className="mx-auto mb-3" />
          <h1 className="text-3xl font-bold tracking-tight">Memory Journal</h1>
          <p className="mt-1 text-sm opacity-60">Hold them tight</p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 shadow-xl">
          {onBackToLanding && !isPasswordRecovery && (mode === 'signin' || mode === 'signup') && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="mb-4 inline-flex items-center gap-1 text-sm opacity-70 hover:opacity-100"
            >
              <ArrowLeft className="size-3.5" />
              Back to overview
            </button>
          )}

          {/* Back arrow for sub-flows */}
          {!isPasswordRecovery && (mode === 'forgot' ||
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
            <>
              <OAuthButtons onClick={handleOAuth} loading={oauthLoading} />
              <Divider label="or continue with email" />
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
            </>
          )}

          {/* --- Sign up --------------------------------------------------- */}
          {mode === 'signup' && (
            <>
              <OAuthButtons onClick={handleOAuth} loading={oauthLoading} />
              <Divider label="or sign up with email" />
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
            </>
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

// Horizontal rule with a centered label.
function Divider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs opacity-60">
      <span className="h-px flex-1 bg-current" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-current" />
    </div>
  );
}

// Row of provider sign-in buttons.
function OAuthButtons({
  onClick,
  loading,
}: {
  onClick: (provider: OAuthProvider) => void;
  loading: OAuthProvider | null;
}) {
  const providers: { id: OAuthProvider; label: string; icon: React.ReactNode }[] = [
    { id: 'google', label: 'Google', icon: <GoogleIcon /> },
    { id: 'github', label: 'GitHub', icon: <GitHubIcon /> },
  ];
  return (
    <div className="space-y-2">
      {providers.map((p) => (
        <Button
          key={p.id}
          type="button"
          variant="outline"
          className="w-full"
          disabled={loading !== null}
          onClick={() => onClick(p.id)}
        >
          {loading === p.id ? (
            <span className="inline-block size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
            p.icon
          )}
          Continue with {p.label}
        </Button>
      ))}
    </div>
  );
}

// Brand glyphs kept inline so the auth screen has no extra dependency and
// renders the same in every theme (currentColor respects dark mode).

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-4">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6.1 29.2 4 24 4 13 4 4 13 4 24s9 20 20 20c11 0 20-9 20-20 0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6.1 29.2 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C41.1 35.2 44 30 44 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}

function AppleIcon() {
  // Kept for future use — will be re-enabled once Apple Developer
  // enrollment and Sign-in-with-Apple are configured.
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _keepAppleIconReference = AppleIcon;

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="currentColor">
      <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.58v-2.17c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.23 1.83 1.23 1.07 1.83 2.81 1.3 3.5.99.1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .3"/>
    </svg>
  );
}
