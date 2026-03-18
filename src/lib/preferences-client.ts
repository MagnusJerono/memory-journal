export interface UserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  autoSave: boolean;
}

import { getCurrentUser } from './auth-client';

export interface SettingsData {
  preferences: UserPreferences;
  personalVoiceSample: string;
}

interface PreferencesApiResponse {
  preferences?: Partial<UserPreferences> | null;
  personalVoiceSample?: string | null;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  notifications: true,
  emailUpdates: false,
  autoSave: true,
};

const STORAGE_KEYS = {
  preferences: 'tightly-user-preferences',
  voice: 'tightly-personal-voice-sample',
};

const DEFAULT_ENDPOINT = '/api/preferences';
let apiUsable: boolean | null = null;

async function buildRequestHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  try {
    const user = await getCurrentUser();
    if (user?.login) {
      headers['x-user-id'] = user.login;
    }
  } catch {
    // Keep anonymous fallback behavior.
  }

  return headers;
}

function resolveEndpoint(): string {
  const endpoint = import.meta.env.VITE_PREFERENCES_API_ENDPOINT as string | undefined;
  return endpoint && endpoint.trim().length > 0 ? endpoint : DEFAULT_ENDPOINT;
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function mergePreferences(preferences?: Partial<UserPreferences> | null): UserPreferences {
  return {
    notifications: preferences?.notifications ?? DEFAULT_PREFERENCES.notifications,
    emailUpdates: preferences?.emailUpdates ?? DEFAULT_PREFERENCES.emailUpdates,
    autoSave: preferences?.autoSave ?? DEFAULT_PREFERENCES.autoSave,
  };
}

function readLocalSettings(): SettingsData {
  if (!canUseStorage()) {
    return {
      preferences: DEFAULT_PREFERENCES,
      personalVoiceSample: '',
    };
  }

  try {
    const prefsRaw = window.localStorage.getItem(STORAGE_KEYS.preferences);
    const voice = window.localStorage.getItem(STORAGE_KEYS.voice) ?? '';
    const parsed = prefsRaw ? (JSON.parse(prefsRaw) as Partial<UserPreferences>) : null;

    return {
      preferences: mergePreferences(parsed),
      personalVoiceSample: voice,
    };
  } catch {
    return {
      preferences: DEFAULT_PREFERENCES,
      personalVoiceSample: '',
    };
  }
}

function writeLocalSettings(data: Partial<SettingsData>): void {
  if (!canUseStorage()) {
    return;
  }

  if (data.preferences) {
    window.localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(data.preferences));
  }

  if (typeof data.personalVoiceSample === 'string') {
    window.localStorage.setItem(STORAGE_KEYS.voice, data.personalVoiceSample);
  }
}

async function fetchSettingsFromApi(): Promise<SettingsData> {
  const identityHeaders = await buildRequestHeaders();
  const response = await fetch(resolveEndpoint(), {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json', ...identityHeaders },
  });

  if (!response.ok) {
    throw new Error(`Preferences API failed (${response.status})`);
  }

  const payload = (await response.json()) as PreferencesApiResponse;
  return {
    preferences: mergePreferences(payload.preferences),
    personalVoiceSample: payload.personalVoiceSample ?? '',
  };
}

async function saveSettingsToApi(data: Partial<SettingsData>): Promise<void> {
  const identityHeaders = await buildRequestHeaders();
  const response = await fetch(resolveEndpoint(), {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...identityHeaders },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Preferences API save failed (${response.status})`);
  }
}

export async function loadSettingsData(): Promise<SettingsData> {
  if (apiUsable === false) {
    return readLocalSettings();
  }

  try {
    const remote = await fetchSettingsFromApi();
    apiUsable = true;
    writeLocalSettings(remote);
    return remote;
  } catch {
    apiUsable = false;
    return readLocalSettings();
  }
}

export async function persistSettingsData(data: Partial<SettingsData>): Promise<void> {
  writeLocalSettings(data);

  if (apiUsable === false) {
    return;
  }

  try {
    await saveSettingsToApi(data);
    apiUsable = true;
  } catch {
    apiUsable = false;
  }
}

export { DEFAULT_PREFERENCES };
