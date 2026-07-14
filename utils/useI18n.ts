import { useCallback } from 'react';

/**
 * Custom hook for extension i18n (`browser.i18n.getMessage`).
 *
 * Returns a stable `t` function reference to prevent infinite re-render loops.
 *
 * Usage:
 *   const { t } = useI18n();
 *   t('key');               // simple string
 *   t('key', ['param1']);   // with substitutions ($1, $2)
 */
export function useI18n() {
  const t = useCallback(
    (key: string, substitutions?: string | string[]): string => {
      return browser.i18n.getMessage(key, substitutions) ?? key;
    },
    [],
  );

  return { t };
}
