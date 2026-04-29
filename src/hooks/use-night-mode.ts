import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';
import { ThemeMode } from '@/lib/types';

export const DEFAULT_THEME_MODE: ThemeMode = 'light';

function getSunTimes(): { sunrise: Date; sunset: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  
  const sunrise = new Date(year, month, day, 6, 30);
  const sunset = new Date(year, month, day, 19, 30);
  
  return { sunrise, sunset };
}

function isNightTime(): boolean {
  const now = new Date();
  const { sunrise, sunset } = getSunTimes();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinutes;
  
  const sunriseMinutes = sunrise.getHours() * 60 + sunrise.getMinutes();
  const sunsetMinutes = sunset.getHours() * 60 + sunset.getMinutes();
  
  return currentTimeInMinutes < sunriseMinutes || currentTimeInMinutes >= sunsetMinutes;
}

export function getSystemPrefersDark(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
}

export function resolveThemeMode(themeMode: ThemeMode | undefined, isNight: boolean, systemPrefersDark: boolean): 'light' | 'dark' {
  switch (themeMode || DEFAULT_THEME_MODE) {
    case 'dark':
      return 'dark';
    case 'system':
      return systemPrefersDark ? 'dark' : 'light';
    case 'auto':
      return isNight ? 'dark' : 'light';
    case 'light':
    default:
      return 'light';
  }
}

export function useNightMode() {
  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>('tightly-theme-mode', DEFAULT_THEME_MODE);
  const [isNight, setIsNight] = useState(isNightTime());
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark());
  
  useEffect(() => {
    const checkTime = () => {
      setIsNight(isNightTime());
    };
    
    checkTime();
    
    const interval = setInterval(checkTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = () => setSystemPrefersDark(mediaQuery.matches);

    updateSystemTheme();
    mediaQuery.addEventListener('change', updateSystemTheme);

    return () => mediaQuery.removeEventListener('change', updateSystemTheme);
  }, []);
  
  const effectiveTheme = resolveThemeMode(themeMode, isNight, systemPrefersDark);
  
  const isDarkMode = effectiveTheme === 'dark';
  
  return {
    themeMode: themeMode || DEFAULT_THEME_MODE,
    setThemeMode,
    isDarkMode,
    isAutoMode: (themeMode || DEFAULT_THEME_MODE) === 'auto',
    isNightTime: isNight,
  };
}
