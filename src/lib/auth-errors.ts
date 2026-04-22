// Maps Supabase AuthError messages / codes into short, human-friendly copy.
// We deliberately keep this list small and fall back to the original message
// so nothing is silently hidden.

import type { AuthError } from '@supabase/supabase-js';

type FriendlyError = { message: string; hint?: string };

export function friendlyAuthError(err: AuthError | Error | null | undefined): FriendlyError | null {
  if (!err) return null;
  const raw = err.message ?? '';
  const lower = raw.toLowerCase();

  // Supabase exposes a numeric HTTP status on AuthError; 429 = rate limit.
  const status = (err as AuthError).status;

  if (lower.includes('invalid login credentials')) {
    return { message: "That email and password don't match." };
  }
  if (lower.includes('email not confirmed')) {
    return {
      message: 'Please confirm your email first.',
      hint: 'Check your inbox for a verification link.',
    };
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return {
      message: 'An account with that email already exists.',
      hint: 'Try signing in instead, or reset your password.',
    };
  }
  if (lower.includes('password should be at least')) {
    return { message: 'Password must be at least 6 characters.' };
  }
  if (lower.includes('unable to validate email') || lower.includes('invalid email')) {
    return { message: "That email address doesn't look right." };
  }
  if (lower.includes('new password should be different')) {
    return { message: 'Your new password must be different from the old one.' };
  }
  if (lower.includes('signup is disabled') || lower.includes('signups not allowed')) {
    return { message: 'New sign-ups are currently disabled.' };
  }
  if (lower.includes('email rate limit') || status === 429) {
    return {
      message: 'Too many attempts — please wait a moment and try again.',
    };
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return {
      message: "Couldn't reach the server.",
      hint: 'Check your internet connection and try again.',
    };
  }

  // Fallback: surface the raw message so we never swallow unknown errors.
  return { message: raw || 'Something went wrong. Please try again.' };
}
