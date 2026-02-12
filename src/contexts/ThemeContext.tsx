import { createContext, useContext, ReactNode } from 'react';
import { ThemeMode } from '@/lib/types';
import { useNightMode } from '@/hooks/use-night-mode';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
  isNightTime: boolean;
  isAutoMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const nightMode = useNightMode();

  return (
    <ThemeContext.Provider value={nightMode}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
