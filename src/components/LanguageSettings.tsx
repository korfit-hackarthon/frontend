import { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useVirtualScroll,
  createVirtualScrollHandler,
} from '@/hooks/useVirtualScroll';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Globe, Check, Search, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getEnabledLanguages,
  getLanguagesByRegion,
  findLanguageByCode,
  searchLanguages,
  type Language,
} from '@/data/languages';

interface LanguageSettingsProps {
  className?: string;
}

export default function LanguageSettings({
  className = '',
}: LanguageSettingsProps) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(
    new Set(['East Asia', 'Western'])
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [_scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const currentLanguage =
    findLanguageByCode(i18n.language) || getEnabledLanguages()[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  // 검색 결과
  const searchResults = useMemo(() => {
    return searchLanguages(searchQuery);
  }, [searchQuery]);

  // 지역별 그룹화된 언어
  const languagesByRegion = useMemo(() => {
    return getLanguagesByRegion();
  }, []);

  // 가상 스크롤링을 위한 플랫 리스트 (검색 시에만 사용)
  const flatSearchResults = useMemo(() => {
    return searchQuery ? searchResults : [];
  }, [searchQuery, searchResults]);

  // 가상 스크롤링 설정
  const virtualScroll = useVirtualScroll({
    items: flatSearchResults,
    itemHeight: viewMode === 'grid' ? 80 : 60,
    containerHeight: 400, // 최대 높이
    overscan: 3,
  });

  const handleScroll = createVirtualScrollHandler(setScrollTop);

  const toggleRegion = (region: string) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(region)) {
      newExpanded.delete(region);
    } else {
      newExpanded.add(region);
    }
    setExpandedRegions(newExpanded);
  };

  const renderLanguageCard = (lang: Language) => (
    <button
      key={lang.code}
      onClick={() => changeLanguage(lang.code)}
      className={`group relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 hover:bg-gray-50 hover:shadow-md ${
        currentLanguage.code === lang.code
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-gray-200'
      }`}
    >
      <span className='text-2xl group-hover:scale-110 transition-transform duration-200'>
        {lang.flag}
      </span>
      <div className='flex-1 text-left min-w-0'>
        <div className='font-medium text-sm truncate'>{lang.nativeName}</div>
        <div className='text-xs text-muted-foreground truncate'>
          {lang.name}
        </div>
      </div>
      {lang.direction === 'rtl' && (
        <Badge variant='outline' className='text-xs'>
          RTL
        </Badge>
      )}
      {currentLanguage.code === lang.code && (
        <div className='absolute -top-1 -right-1 p-1 bg-primary rounded-full shadow-lg'>
          <Check className='h-3 w-3 text-white' />
        </div>
      )}
    </button>
  );

  const renderLanguageList = (lang: Language) => (
    <button
      key={lang.code}
      onClick={() => changeLanguage(lang.code)}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:bg-gray-50 ${
        currentLanguage.code === lang.code
          ? 'border-primary bg-primary/5'
          : 'border-gray-200'
      }`}
    >
      <span className='text-xl'>{lang.flag}</span>
      <div className='flex-1 text-left'>
        <div className='font-medium text-sm'>{lang.nativeName}</div>
        <div className='text-xs text-muted-foreground'>{lang.name}</div>
      </div>
      <div className='flex items-center gap-2'>
        {lang.direction === 'rtl' && (
          <Badge variant='outline' className='text-xs'>
            RTL
          </Badge>
        )}
        {currentLanguage.code === lang.code && (
          <div className='p-1 bg-primary rounded-full'>
            <Check className='h-3 w-3 text-white' />
          </div>
        )}
      </div>
    </button>
  );

  return (
    <div className={`rounded-lg border p-4 bg-white ${className}`}>
      {/* 헤더 */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <div className='p-2 bg-primary/10 rounded-md'>
            <Globe className='h-4 w-4 text-primary' />
          </div>
          <div className='text-sm font-medium'>
            {t('settings.languageSettings', '시스템 언어 설정')}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className='p-2 rounded-md border hover:bg-gray-50 transition-colors'
            title={viewMode === 'grid' ? 'List View' : 'Grid View'}
          >
            {viewMode === 'grid' ? '☰' : '⊞'}
          </button>
        </div>
      </div>

      {/* 현재 언어 표시 */}
      <div className='mb-4 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20'>
        <div className='flex items-center gap-3'>
          <span className='text-2xl'>{currentLanguage.flag}</span>
          <div>
            <div className='font-medium text-sm'>
              {currentLanguage.nativeName}
            </div>
            <div className='text-xs text-muted-foreground'>
              {t('settings.currentLanguage', '현재 언어')} •{' '}
              {currentLanguage.name}
            </div>
          </div>
        </div>
      </div>

      {/* 검색 */}
      <div className='relative mb-4'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder={t('settings.searchLanguages', '언어 검색...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='pl-10'
        />
      </div>

      {/* 언어 목록 */}
      <div className='space-y-4'>
        {searchQuery ? (
          // 검색 결과 (가상 스크롤링 적용)
          <div>
            <div className='text-xs text-muted-foreground mb-3'>
              {t('settings.searchResults', '검색 결과')} ({searchResults.length}
              )
            </div>

            {searchResults.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                {t('settings.noLanguagesFound', '언어를 찾을 수 없습니다')}
              </div>
            ) : searchResults.length > 20 ? (
              // 가상 스크롤링 (20개 이상일 때)
              <div
                ref={scrollElementRef}
                className='relative border rounded-lg'
                style={{ height: '400px', overflow: 'auto' }}
                onScroll={handleScroll}
              >
                <div
                  style={{
                    height: virtualScroll.totalHeight,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      transform: `translateY(${virtualScroll.offsetY}px)`,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                    }}
                  >
                    <div
                      className={
                        viewMode === 'grid'
                          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3'
                          : 'space-y-2 p-3'
                      }
                    >
                      {virtualScroll.virtualItems.map((lang, index) => (
                        <div
                          key={`${lang.code}-${
                            virtualScroll.startIndex + index
                          }`}
                          style={{
                            height: viewMode === 'grid' ? '80px' : '60px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {viewMode === 'grid'
                            ? renderLanguageCard(lang)
                            : renderLanguageList(lang)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // 일반 렌더링 (20개 이하일 때)
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
                    : 'space-y-2'
                }
              >
                {searchResults.map((lang) =>
                  viewMode === 'grid'
                    ? renderLanguageCard(lang)
                    : renderLanguageList(lang)
                )}
              </div>
            )}
          </div>
        ) : (
          // 지역별 그룹화
          Object.entries(languagesByRegion).map(([region, languages]) => (
            <div key={region}>
              <button
                onClick={() => toggleRegion(region)}
                className='w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-3'
              >
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-sm'>
                    {t(
                      `settings.regions.${region
                        .toLowerCase()
                        .replace(' ', '')}`,
                      region
                    )}
                  </span>
                  <Badge variant='secondary' className='text-xs'>
                    {languages.length}
                  </Badge>
                </div>
                {expandedRegions.has(region) ? (
                  <ChevronUp className='h-4 w-4' />
                ) : (
                  <ChevronDown className='h-4 w-4' />
                )}
              </button>

              {expandedRegions.has(region) && (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4'
                      : 'space-y-2 mb-4'
                  }
                >
                  {languages.map((lang) =>
                    viewMode === 'grid'
                      ? renderLanguageCard(lang)
                      : renderLanguageList(lang)
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 안내 메시지 */}
      <div className='mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200'>
        <div className='flex items-center gap-2'>
          <Globe className='h-4 w-4 text-blue-600 flex-shrink-0' />
          <div className='text-xs text-blue-700'>
            {t('settings.languageNote', '언어 변경은 즉시 적용됩니다')}
          </div>
        </div>
      </div>
    </div>
  );
}
