import { useState, useCallback } from 'react';

/**
 * Persists state to localStorage.
 *
 * Usage:
 *   const [value, setValue, deleteValue] = useLocalStorage('key', defaultValue);
 */
export function useLocalStorage<T = string>(
  key: string,
  initialValue?: T,
): readonly [T | undefined, (newValue: T | ((oldValue?: T) => T)) => void, () => void] {
  const readValue = (): T | undefined => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initialValue;
      return JSON.parse(raw) as T;
    } catch {
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T | undefined>(readValue);

  const setValue = useCallback(
    (newValue: T | ((oldValue?: T) => T)) => {
      setStoredValue((current) => {
        const next =
          typeof newValue === 'function'
            ? (newValue as (oldValue?: T) => T)(current)
            : newValue;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch (err) {
          console.error(`[useLocalStorage] Failed to write key "${key}":`, err);
        }
        return next;
      });
    },
    [key],
  );

  const deleteValue = useCallback(() => {
    setStoredValue(undefined);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }, [key]);

  return [storedValue, setValue, deleteValue] as const;
}
