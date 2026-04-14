import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';
import { ThemeMode } from '@/lib/types';

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

export function useNightMode() {
  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>('tightly-theme-mode', 'auto');
  const [isNight, setIsNight] = useState(isNightTime());
  
  useEffect(() => {
    const checkTime = () => {
      setIsNight(isNightTime());
    };
    
    checkTime();
    
    const interval = setInterval(checkTime, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const effectiveTheme = (() => {
    if (themeMode === 'auto') {
      return isNight ? 'dark' : 'light';
    }
    return themeMode;
  })();
  
  const isDarkMode = effectiveTheme === 'dark';
  
  return {
    themeMode: themeMode || 'auto',
    setThemeMode,
    isDarkMode,
    isAutoMode: (themeMode || 'auto') === 'auto',
    isNightTime: isNight,
  };
}
