import { useCallback, useEffect, useState } from 'react';
import { PhotoLibrary, type PhotoAsset, type PhotoPermissionState } from '@/lib/photo-library';
import { clusterMoments, type MomentCluster } from '@/lib/moments';
import { generateMomentPrompt, type MomentPrompt } from '@/lib/moments-prompt';
import { useLanguage } from '@/hooks/use-language.tsx';
import { useLocalStorage } from '@/hooks/use-local-storage';

export interface MomentSuggestion {
  cluster: MomentCluster;
  prompt: MomentPrompt;
  /** Cached thumbnail data URL for the cover. */
  coverDataUrl: string | null;
}

interface UseMomentsResult {
  enabled: boolean;
  setEnabled: (next: boolean) => void;
  permission: PhotoPermissionState;
  loading: boolean;
  error: string | null;
  suggestions: MomentSuggestion[];
  /** Trigger the native permission prompt + initial scan. */
  request: () => Promise<void>;
  /** Mark a moment as not interesting so it stops appearing. */
  dismiss: (clusterId: string) => void;
  /** Re-run the scan (e.g. pull-to-refresh). */
  refresh: () => Promise<void>;
}

const DISMISSED_KEY = 'moments:dismissed:v1';
const ENABLED_KEY = 'moments:enabled:v1';
const MAX_SUGGESTIONS = 6;

export function useMoments(): UseMomentsResult {
  const { language } = useLanguage();
  const [enabled, setEnabledRaw] = useLocalStorage<boolean>(ENABLED_KEY, false);
  const [dismissed, setDismissed] = useLocalStorage<string[]>(DISMISSED_KEY, []);
  const [permission, setPermission] = useState<PhotoPermissionState>('prompt');
  const [suggestions, setSuggestions] = useState<MomentSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildSuggestions = useCallback(
    async (assets: PhotoAsset[]) => {
      const dismissedSet = new Set(dismissed ?? []);
      const clusters = clusterMoments(assets, { dismissedAssetIds: dismissedSet });
      const top = clusters.slice(-MAX_SUGGESTIONS).reverse();

      const result: MomentSuggestion[] = [];
      for (const cluster of top) {
        try {
          const [prompt, thumb] = await Promise.all([
            generateMomentPrompt(cluster, language),
            PhotoLibrary.getThumbnail({ id: cluster.coverAssetId, size: 320 }).catch(
              () => null,
            ),
          ]);
          result.push({
            cluster,
            prompt,
            coverDataUrl: thumb ? `data:image/jpeg;base64,${thumb.base64}` : null,
          });
        } catch (err) {
          console.warn('[useMoments] failed to build suggestion', err);
        }
      }
      return result;
    },
    [dismissed, language],
  );

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const status = (await PhotoLibrary.checkPermission()).status;
      setPermission(status);
      if (status !== 'granted' && status !== 'limited') {
        setSuggestions([]);
        return;
      }
      const { assets } = await PhotoLibrary.listAssets({});
      const built = await buildSuggestions(assets);
      setSuggestions(built);
    } catch (err) {
      console.error('[useMoments] refresh failed', err);
      setError(err instanceof Error ? err.message : 'Failed to load moments');
    } finally {
      setLoading(false);
    }
  }, [enabled, buildSuggestions]);

  const request = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await PhotoLibrary.requestPermission();
      setPermission(status);
      if (status === 'granted' || status === 'limited') {
        setEnabledRaw(true);
        const { assets } = await PhotoLibrary.listAssets({});
        const built = await buildSuggestions(assets);
        setSuggestions(built);
      }
    } catch (err) {
      console.error('[useMoments] request failed', err);
      setError(err instanceof Error ? err.message : 'Permission failed');
    } finally {
      setLoading(false);
    }
  }, [buildSuggestions, setEnabledRaw]);

  const dismiss = useCallback(
    (clusterId: string) => {
      const target = suggestions.find(s => s.cluster.id === clusterId);
      if (!target) return;
      const next = Array.from(new Set([...(dismissed ?? []), ...target.cluster.assetIds]));
      setDismissed(next);
      setSuggestions(prev => prev.filter(s => s.cluster.id !== clusterId));
    },
    [suggestions, dismissed, setDismissed],
  );

  const setEnabled = useCallback(
    (next: boolean) => {
      setEnabledRaw(next);
      if (!next) setSuggestions([]);
    },
    [setEnabledRaw],
  );

  useEffect(() => {
    if (enabled) {
      void refresh();
    }
  }, [enabled, refresh]);

  return {
    enabled: !!enabled,
    setEnabled,
    permission,
    loading,
    error,
    suggestions,
    request,
    dismiss,
    refresh,
  };
}
