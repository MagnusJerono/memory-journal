import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_PREFERENCES,
  type UserPreferences,
  loadSettingsData,
  persistSettingsData,
} from '@/lib/preferences-client';

export function useSettingsPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [personalVoiceSample, setPersonalVoiceSampleState] = useState('');

  useEffect(() => {
    loadSettingsData().then((settings) => {
      setPreferences(settings.preferences);
      setPersonalVoiceSampleState(settings.personalVoiceSample);
    }).catch(() => {
      setPreferences(DEFAULT_PREFERENCES);
      setPersonalVoiceSampleState('');
    });
  }, []);

  const updatePreference = useCallback((key: keyof UserPreferences, value: boolean) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      void persistSettingsData({ preferences: next });
      return next;
    });
  }, []);

  const setPersonalVoiceSample = useCallback((value: string) => {
    setPersonalVoiceSampleState(value);
    void persistSettingsData({ personalVoiceSample: value });
  }, []);

  return {
    preferences,
    personalVoiceSample,
    updatePreference,
    setPersonalVoiceSample,
  };
}
