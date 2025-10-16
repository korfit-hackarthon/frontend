export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  direction: 'ltr' | 'rtl';
  enabled: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  // 동아시아
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    region: 'East Asia',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    region: 'East Asia',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    region: 'East Asia',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'zh-TW',
    name: 'Chinese (Traditional)',
    nativeName: '繁體中文',
    flag: '🇹🇼',
    region: 'East Asia',
    direction: 'ltr',
    enabled: true,
  },

  // 서구 언어
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    region: 'Western',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    region: 'Western',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    region: 'Western',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    region: 'Western',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    region: 'Western',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    region: 'Western',
    direction: 'ltr',
    enabled: true,
  },

  // 동남아시아
  {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    region: 'Southeast Asia',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    region: 'Southeast Asia',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    region: 'Southeast Asia',
    direction: 'ltr',
    enabled: true,
  },

  // 남아시아
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    region: 'South Asia',
    direction: 'ltr',
    enabled: true,
  },

  // 중동
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    region: 'Middle East',
    direction: 'rtl',
    enabled: true,
  },

  // 동유럽
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    region: 'Eastern Europe',
    direction: 'ltr',
    enabled: true,
  },
];

// 활성화된 언어만 가져오기
export const getEnabledLanguages = (): Language[] => {
  return SUPPORTED_LANGUAGES.filter((lang) => lang.enabled);
};

// 지역별로 그룹화
export const getLanguagesByRegion = (): Record<string, Language[]> => {
  const enabledLanguages = getEnabledLanguages();
  return enabledLanguages.reduce((acc, lang) => {
    if (!acc[lang.region]) {
      acc[lang.region] = [];
    }
    acc[lang.region].push(lang);
    return acc;
  }, {} as Record<string, Language[]>);
};

// 언어 코드로 언어 정보 찾기
export const findLanguageByCode = (code: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
};

// 언어 검색
export const searchLanguages = (query: string): Language[] => {
  if (!query.trim()) return getEnabledLanguages();

  const lowercaseQuery = query.toLowerCase();
  return getEnabledLanguages().filter(
    (lang) =>
      lang.name.toLowerCase().includes(lowercaseQuery) ||
      lang.nativeName.toLowerCase().includes(lowercaseQuery) ||
      lang.code.toLowerCase().includes(lowercaseQuery)
  );
};
