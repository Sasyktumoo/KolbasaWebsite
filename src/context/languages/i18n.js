// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en.json';
import ru from './translations/ru.json';
import es from './translations/es.json';
import uk from './translations/uk.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: en,
      ru: ru,
      es: es,
      uk: uk
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;