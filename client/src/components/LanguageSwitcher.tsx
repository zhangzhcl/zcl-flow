import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

/**
 * Toggle between Chinese and English.
 */
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const next = i18n.language?.startsWith('zh') ? 'en' : 'zh';

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(next)}
      title={t('common.language')}
      className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"
    >
      <Languages size={14} />
      <span className="uppercase">{next}</span>
    </button>
  );
}
