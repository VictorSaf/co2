import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en';
import roTranslation from './locales/ro';
import zhTranslation from './locales/zh';

const resources = {
  en: {
    translation: enTranslation
  },
  ro: {
    translation: roTranslation
  },
  zh: {
    translation: zhTranslation
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for React
      prefix: '{',
      suffix: '}',
      formatSeparator: ',',
      // Log all mismatched translation keys
      missingKeyHandler: (lngs, ns, key, fallbackValue) => {
        console.log(`Missing translation key: '${key}' for languages: ${lngs.join(', ')}, fallback: '${fallbackValue}'`);
      },
      debug: true
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    react: {
      useSuspense: false
    },
    saveMissing: true,
    debug: true
  });

export default i18n;