type UserPreferences = {
  notifications?: boolean;
  emailUpdates?: boolean;
  autoSave?: boolean;
};

type PreferencesPayload = {
  preferences?: UserPreferences;
  personalVoiceSample?: string;
};

type StoredPreferences = {
  preferences: UserPreferences;
  personalVoiceSample: string;
  updatedAt: string;
};

const DEFAULT_PREFERENCES: UserPreferences = {
  notifications: true,
  emailUpdates: false,
  autoSave: true,
};

const REQUIRE_AUTH_FOR_PREFERENCES = process.env.REQUIRE_AUTH_FOR_PREFERENCES === 'true';
const store = new Map<string, StoredPreferences>();

function normalizeIdentity(rawIdentity: string): string {
  return rawIdentity.trim().toLowerCase().slice(0, 128);
}

function getIdentity(req: any): string {
  const headerIdentity = req.headers?.['x-user-id'] as string | undefined;
  if (headerIdentity && headerIdentity.trim().length > 0) {
    return normalizeIdentity(headerIdentity);
  }

  const forwardedFor = (req.headers?.['x-forwarded-for'] as string | undefined) ?? '';
  const firstForwarded = forwardedFor.split(',')[0]?.trim();
  const fallbackIp = firstForwarded || req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
  return normalizeIdentity(`ip:${fallbackIp}`);
}

function hasAuthenticatedIdentity(req: any): boolean {
  const headerIdentity = req.headers?.['x-user-id'] as string | undefined;
  return Boolean(headerIdentity && headerIdentity.trim().length > 0);
}

function mergePreferences(preferences?: UserPreferences): UserPreferences {
  return {
    notifications: preferences?.notifications ?? DEFAULT_PREFERENCES.notifications,
    emailUpdates: preferences?.emailUpdates ?? DEFAULT_PREFERENCES.emailUpdates,
    autoSave: preferences?.autoSave ?? DEFAULT_PREFERENCES.autoSave,
  };
}

function getStored(identity: string): StoredPreferences {
  const existing = store.get(identity);
  if (existing) {
    return existing;
  }

  const next: StoredPreferences = {
    preferences: DEFAULT_PREFERENCES,
    personalVoiceSample: '',
    updatedAt: new Date().toISOString(),
  };
  store.set(identity, next);
  return next;
}

export default async function handler(req: any, res: any) {
  if (REQUIRE_AUTH_FOR_PREFERENCES && !hasAuthenticatedIdentity(req)) {
    res.status(401).json({ error: 'Authentication required for preferences' });
    return;
  }

  const identity = getIdentity(req);

  if (req.method === 'GET') {
    const current = getStored(identity);
    res.status(200).json({
      preferences: mergePreferences(current.preferences),
      personalVoiceSample: current.personalVoiceSample,
      updatedAt: current.updatedAt,
    });
    return;
  }

  if (req.method === 'PUT') {
    const body = (req.body || {}) as PreferencesPayload;
    const current = getStored(identity);

    const next: StoredPreferences = {
      preferences: body.preferences
        ? mergePreferences({ ...current.preferences, ...body.preferences })
        : current.preferences,
      personalVoiceSample: typeof body.personalVoiceSample === 'string'
        ? body.personalVoiceSample
        : current.personalVoiceSample,
      updatedAt: new Date().toISOString(),
    };

    store.set(identity, next);

    res.status(200).json({
      ok: true,
      preferences: next.preferences,
      personalVoiceSample: next.personalVoiceSample,
      updatedAt: next.updatedAt,
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
