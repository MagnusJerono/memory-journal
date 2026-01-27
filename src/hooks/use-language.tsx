import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useKV } from '@github/spark/hooks';
import { AppLanguage, detectBrowserLanguage, getTranslations } from '@/lib/i18n';

type TranslationKeys = ReturnType<typeof getTranslations>;

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  autoDetect: boolean;
  setAutoDetect: (value: boolean) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [storedPrefs, setStoredPrefs] = useKV<{ language: AppLanguage; autoDetect: boolean } | null>(
    'tightly-language-prefs',
    null
  );
  const [isInitialized, setIsInitialized] = useState(false);
  
  const detectedLanguage = detectBrowserLanguage();
  
  const autoDetect = storedPrefs?.autoDetect ?? true;
  const language = autoDetect ? detectedLanguage : (storedPrefs?.language ?? detectedLanguage);
  
  useEffect(() => {
    if (storedPrefs === null && !isInitialized) {
      setStoredPrefs({
        language: detectedLanguage,
        autoDetect: true
      });
      setIsInitialized(true);
    } else if (storedPrefs !== null) {
      setIsInitialized(true);
    }
  }, [storedPrefs, detectedLanguage, isInitialized, setStoredPrefs]);

  const setLanguage = (lang: AppLanguage) => {
    setStoredPrefs(current => ({
      language: lang,
      autoDetect: current?.autoDetect ?? false
    }));
  };

  const setAutoDetect = (value: boolean) => {
    setStoredPrefs(current => ({
      language: value ? detectedLanguage : (current?.language ?? detectedLanguage),
      autoDetect: value
    }));
  };

  const t = getTranslations(language);

  const value: LanguageContextType = {
    language,
    setLanguage,
    autoDetect,
    setAutoDetect,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
