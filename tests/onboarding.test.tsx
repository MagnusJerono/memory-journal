import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, renderHook, act } from '@testing-library/react';
import {
  OnboardingTour,
  useOnboardingCompleted,
  ONBOARDING_STORAGE_KEY,
} from '../src/components/onboarding/OnboardingTour';

function clearKey() {
  try {
    globalThis.localStorage?.removeItem?.(ONBOARDING_STORAGE_KEY);
  } catch {
    /* no-op */
  }
}

describe('OnboardingTour', () => {
  beforeEach(() => {
    clearKey();
  });

  afterEach(() => {
    cleanup();
    clearKey();
    vi.restoreAllMocks();
  });

  it('walks through steps and calls onStartWriting on finish', () => {
    const onStartWriting = vi.fn();
    render(<OnboardingTour onStartWriting={onStartWriting} />);

    expect(screen.getByText('Capture a memory')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Group memories into chapters')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Print a beautiful book')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /start writing/i }));

    expect(onStartWriting).toHaveBeenCalledTimes(1);
  });

  it('previous step button navigates back', () => {
    render(<OnboardingTour onStartWriting={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Group memories into chapters')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /previous step/i }));
    expect(screen.getByText('Capture a memory')).toBeTruthy();
  });

  it('useOnboardingCompleted flips to true after markCompleted', () => {
    const { result } = renderHook(() => useOnboardingCompleted());
    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(true);
  });
});

