import { useEffect, useState } from 'react';
import { getQuota, subscribeQuota, type QuotaSnapshot } from '@/lib/ai-quota';

export function useAIQuota(): QuotaSnapshot {
  const [snapshot, setSnapshot] = useState<QuotaSnapshot>(() => getQuota());
  useEffect(() => subscribeQuota(setSnapshot), []);
  return snapshot;
}
