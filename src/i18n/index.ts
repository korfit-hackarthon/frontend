import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 번역 리소스
import koTranslations from './locales/ko.json';
import enTranslations from './locales/en.json';
import jaTranslations from './locales/ja.json';
import zhCNTranslations from './locales/zh-CN.json';
import zhTWTranslations from './locales/zh-TW.json';
import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';
import deTranslations from './locales/de.json';
import itTranslations from './locales/it.json';
import ptTranslations from './locales/pt.json';
import thTranslations from './locales/th.json';
import viTranslations from './locales/vi.json';
import idTranslations from './locales/id.json';
import hiTranslations from './locales/hi.json';
import arTranslations from './locales/ar.json';
import ruTranslations from './locales/ru.json';

const resources = {
  ko: {
    translation: koTranslations,
  },
  en: {
    translation: enTranslations,
  },
  ja: {
    translation: jaTranslations,
  },
  'zh-CN': {
    translation: zhCNTranslations,
  },
  'zh-TW': {
    translation: zhTWTranslations,
  },
  es: {
    translation: esTranslations,
  },
  fr: {
    translation: frTranslations,
  },
  de: {
    translation: deTranslations,
  },
  it: {
    translation: itTranslations,
  },
  pt: {
    translation: ptTranslations,
  },
  th: {
    translation: thTranslations,
  },
  vi: {
    translation: viTranslations,
  },
  id: {
    translation: idTranslations,
  },
  hi: {
    translation: hiTranslations,
  },
  ar: {
    translation: arTranslations,
  },
  ru: {
    translation: ruTranslations,
  },
};

i18n
  // 언어 감지
  .use(LanguageDetector)
  // React i18next 연결
  .use(initReactI18next)
  // 초기화
  .init({
    resources,
    fallbackLng: 'ko', // 기본 언어
    debug: process.env.NODE_ENV === 'development',

    // 언어 감지 설정
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React는 XSS를 자동으로 방지
    },
  });

export default i18n;
