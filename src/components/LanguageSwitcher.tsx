import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-2">
      {i18n.options.supportedLngs?.filter(lng => lng !== 'cimode').map((lng) => (
        <button
          key={lng}
          className={`px-3 py-1 rounded-md text-sm ${
            i18n.language === lng
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => i18n.changeLanguage(lng)}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}