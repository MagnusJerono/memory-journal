/**
 * Capacitor native runtime bootstrap.
 *
 * Only runs inside the native iOS / Android shell. On the web it is a no-op,
 * so the same bundle works unmodified in both environments.
 */
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapApp } from '@capacitor/app';

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export async function initCapacitor(): Promise<void> {
  if (!isNative()) return;

  // Match status bar to the current system theme. StatusBar APIs are no-ops on
  // web; calling them without guards is fine but we guard anyway for clarity.
  try {
    const prefersDark = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    await StatusBar.setStyle({ style: prefersDark ? Style.Dark : Style.Light });
  } catch {
    // Status bar styling is best-effort; ignore failures.
  }

  // Hide the native splash quickly once React has painted.
  try {
    await SplashScreen.hide({ fadeOutDuration: 250 });
  } catch {
    // Splash hide is best-effort.
  }

  // Deep link handler: Supabase magic-link callbacks open the app with a URL
  // like memoryjournal://auth?#access_token=... — forward the fragment to the
  // Supabase client so it finishes the login.
  CapApp.addListener('appUrlOpen', (event) => {
    try {
      const url = new URL(event.url);
      if (url.hostname === 'auth' || url.pathname.startsWith('/auth')) {
        const hash = url.hash || url.search;
        if (hash && typeof window !== 'undefined') {
          window.location.hash = hash.replace(/^[?#]/, '#');
        }
      }
    } catch {
      // Ignore malformed URLs; Supabase client will also validate.
    }
  });
}
