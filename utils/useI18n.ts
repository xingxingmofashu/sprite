/**
 * Custom hook for extension i18n (`browser.i18n.getMessage`).
 *
 * Usage:
 *   const { t } = useI18n();
 *   t('key');               // simple
 *   t('key', ['param1']);   // with substitutions ($1, $2)
 */
export function useI18n() {
  const t = (key: string, substitutions?: string | string[]): string => {
    return browser.i18n.getMessage(key, substitutions) ?? key;
  };

  return { t };
}
