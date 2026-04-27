import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import da from './da';
import fr from './fr';
import ar from './ar';
import es from './es';

const resources = {
  en: { translation: en },
  da: { translation: da },
  fr: { translation: fr },
  ar: { translation: ar },
  es: { translation: es },
};

const savedLang = localStorage.getItem('matchme_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'da', label: 'Dansk',   flag: '🇩🇰' },
  { code: 'fr', label: 'Français',flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export const RTL_LANGS = new Set(['ar']);
