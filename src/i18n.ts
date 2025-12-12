import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fr from './locales/fr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: en,
      fr: fr,
    },
    lng: 'en', // Force English language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
