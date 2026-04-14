import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DreamyBackground } from '../DreamyBackground';
import { useTheme } from '../../contexts/ThemeContext';

type AuthMode = 'login' | 'signup';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const { isDarkMode } = useTheme();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === 'login') {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err.message);
      }
    } else {
      const { error: err } = await signUp(email, password);
      if (err) {
        setError(err.message);
      } else {
        setInfo('Account created! You can now sign in.');
        setMode('login');
        setPassword('');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <DreamyBackground isDarkMode={isDarkMode} />
      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Memory Journal</h1>
          <p className="mt-1 text-sm opacity-60">Hold them tight</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 shadow-xl">
          <h2 className="text-xl font-semibold mb-6">
            {mode === 'login' ? 'Sign in to your account' : 'Create an account'}
          </h2>

          {info && (
            <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-700 dark:text-green-300">
              {info}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 opacity-80">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 opacity-80">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={mode === 'login' ? '••••••••' : 'Min. 6 characters'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading
                ? 'Please wait…'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm opacity-60">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
                setInfo(null);
              }}
              className="font-medium underline underline-offset-2 hover:opacity-80"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
