import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Language } from './defs';

export const initializeI18n = async (language: Language): Promise<void> => {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      resources: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        en: { translation: require('../locales/en.json') },
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        he: { translation: require('../locales/he.json') },
      },
      lng: language,
      fallbackLng: 'he',
      interpolation: {
        escapeValue: false,
      },
    });
  } else {
    await i18n.changeLanguage(language);
  }
};

export { i18n };
