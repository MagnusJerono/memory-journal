import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME_MODE, resolveThemeMode } from '../src/hooks/use-night-mode';

describe('theme mode resolution', () => {
  it('defaults to light mode instead of automatic night mode', () => {
    expect(DEFAULT_THEME_MODE).toBe('light');
    expect(resolveThemeMode(undefined, true, true)).toBe('light');
  });

  it('only follows system dark mode when system mode is selected', () => {
    expect(resolveThemeMode('light', true, true)).toBe('light');
    expect(resolveThemeMode('system', false, true)).toBe('dark');
    expect(resolveThemeMode('system', true, false)).toBe('light');
  });

  it('keeps explicit night and automatic sunset modes available', () => {
    expect(resolveThemeMode('dark', false, false)).toBe('dark');
    expect(resolveThemeMode('auto', true, false)).toBe('dark');
    expect(resolveThemeMode('auto', false, true)).toBe('light');
  });
});
